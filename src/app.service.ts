import { Injectable, BadRequestException } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppService {
  private openai: OpenAI;
  private genAI: any;
  private pinecone: Pinecone;
  private index: any;

  constructor() {
    // Initialize clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
    this.index = this.pinecone.index(process.env.PINECONE_INDEX || "");
  }

  // Generate text embedding using OpenAI
  private async generateEmbedding(text: string) {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text parameter");
    }
    try {
      const response = await this.openai.embeddings.create({
        input: text,
        model: "text-embedding-3-large",
      });
      return { vector: response.data[0].embedding };
    } catch (error) {
      console.error("Error embedding text:", error);
      return null;
    }
  }

  // Query Pinecone to get top K relevant chunks from a specific namespace
  private async queryPinecone(embeddings: any, topK = 10, namespaceName?: string) {
    if (!embeddings || !embeddings.vector) {
      throw new Error("Invalid embedding format");
    }
    
    // Get the appropriate namespace
    const namespaceObj = namespaceName ? this.index.namespace(namespaceName) : this.index.namespace("");
    
    const queryOptions = {
      vector: embeddings.vector,
      topK,
      includeMetadata: true,
    };
    
    const queryResponse = await namespaceObj.query(queryOptions);
    
    return queryResponse.matches;
  }

  // Query both default and programmersSpecific namespaces
  private async queryBothNamespaces(embeddings: any, topK = 10) {
    // Query default namespace
    const defaultResults = await this.queryPinecone(embeddings, topK);
    
    // Query programmersSpecific namespace (get just one result as the "lecture")
    const programmersSpecificResults = await this.queryPinecone(embeddings, 1, "programmersSpecific");
    
    // Tag the programmersSpecific result as a "lecture"
    const taggedProgrammersSpecificResults = programmersSpecificResults.map(result => ({
      ...result,
      isLecture: true
    }));
    
    // Combine results
    return {
      generalResults: defaultResults,
      lectureResult: taggedProgrammersSpecificResults.length > 0 ? taggedProgrammersSpecificResults[0] : null
    };
  }

  // Query Gemini with context
  private async queryGemini(query: string, nameUser = "User", userInfo = "", contextChunks: Array<{ metadata: { text: string } }> = [], lectureChunk: { metadata: { text: string } } | null = null) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Format general context chunks into a single string
    const formattedContext = contextChunks
        .map((chunk) => `${chunk.metadata.text}`)
        .join("\n\n");
    
    // Format lecture content if available
    const lectureContent = lectureChunk ? 
        `\n\nSpecialized Programming Lecture:\n${lectureChunk.metadata.text}` : 
        '';
    
    const prompt = `
      You are a highly knowledgeable and empathetic personal health assistant specializing in the unique health needs of a programmer named ${nameUser}.
      Your goal is to provide clear, actionable, and science-backed advice tailored to the ${nameUser}'s concerns.

      ${nameUser}'s Question:
      "${query}"

      What You Know About the User:
      ${userInfo}

      Additional Knowledge:
      You have access to the following knowledge base, which you should treat as your own expertise:
      ${formattedContext}
      
      ${lectureContent ? `Programmer-Specific Knowledge:\n${lectureContent}` : ''}

      Guidelines:
      - Make sure 
      - Provide answers in a clear, concise, and engaging manner.
      - Focus on practical, real-world solutions that fit into a programmer's lifestyle.
      - Address health concerns related to prolonged sitting, screen time, stress, diet, sleep, and productivity.
      - If the question is beyond your expertise, encourage the user to seek medical advice rather than speculating.
      - Use an encouraging and supportive tone, but don't sugarcoat important health risks.
      `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Main function to process a query
  async processQuery(nameUser: string, userInfo: string, query: string) {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Retrieve relevant chunks from both namespaces
      const { generalResults, lectureResult } = await this.queryBothNamespaces(embedding);
      
      // If no relevant chunks found in either namespace
      if (generalResults.length === 0 && !lectureResult) {
        return new BadRequestException("I couldn't find any relevant information to answer your question.");
      }
      
      // Generate answer using Gemini with retrieved chunks as context
      const answer = await this.queryGemini(query, nameUser, userInfo, generalResults, lectureResult);
      
      return { answer };
    } catch (error) {
      console.error("Error processing query:", error);
      throw new BadRequestException("An error occurred while processing your query.");
    }
  }

  // Generate a 7-day plan using OpenAI
  async generatePlan(variant: string, userInfo: string, pastExperiences: string) {
    try {
      if (!['workout', 'diet'].includes(variant.toLowerCase())) {
        throw new BadRequestException('Variant must be either "workout" or "diet"');
      }

      const isPlanWorkout = variant.toLowerCase() === 'workout';
      
      const prompt = `
        Generate a personalized 7-day ${variant} plan tailored to the user's profile, goals, and preferences.

        ### User Profile:
        ${userInfo}

        ### Past Experiences & Context:
        ${pastExperiences}

        ### Specific Instructions:
        ${isPlanWorkout 
          ? `
        - Design a comprehensive 7-day workout plan that balances strength, cardio, mobility, and recovery.
        - For each day, include:
          - Exercise names
          - Number of sets and reps (or duration for cardio/mobility)
          - Recommended rest between sets
          - Optional modifications for beginner, intermediate, and advanced levels.
        - Ensure progression and variation across the week to maintain engagement and optimize performance.
        `
          : `
        - Create a personalized, well-balanced 7-day meal plan.
        - For each day, include:
          - Full meals for breakfast, lunch, dinner, and 1-2 snacks
          - Ingredients with measurements (metric or imperial based on user info)
          - Simple preparation instructions (aim for clarity and minimal complexity)
          - Ensure all meals meet the user’s dietary restrictions and support their nutritional goals (e.g., fat loss, muscle gain, energy, etc.)
        - Variety is key: Avoid repeating meals unless requested.
        `
        }

        ### Output Format:
        Return a valid JSON object using this structure:
        {
          "day1": { "plan": "Markdown-formatted plan for Day 1" },
          "day2": { "plan": "Markdown-formatted plan for Day 2" },
          "day3": { "plan": "..." },
          "day4": { "plan": "..." },
          "day5": { "plan": "..." },
          "day6": { "plan": "..." },
          "day7": { "plan": "Markdown-formatted plan for Day 7" }
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a professional ${isPlanWorkout ? 'fitness trainer' : 'nutritionist'} who creates personalized ${variant} plans. Provide detailed, actionable plans in JSON format.`
          },
          { role: "user", content: prompt }
        ],
      });

      const planJson = JSON.parse(response.choices[0].message.content || '{}');
      return planJson;
    } catch (error) {
      console.error(`Error generating ${variant} plan:`, error);
      throw new BadRequestException(`Failed to generate ${variant} plan: ${error.message}`);
    }
  }
}
