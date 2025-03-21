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

  // Query Pinecone to get top K relevant chunks
  private async queryPinecone(embeddings: any, topK = 10) {
    if (!embeddings || !embeddings.vector) {
      throw new Error("Invalid embedding format");
    }
    const queryResponse = await this.index.query({
      vector: embeddings.vector,
      topK,
      includeMetadata: true,
    });
    
    return queryResponse.matches;
  }

  // Query Gemini with context
  private async queryGemini(query: string, nameUser = "User", userInfo = "", contextChunks: Array<{ metadata: { text: string } }> = []) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Format context chunks into a single string
    const formattedContext = contextChunks
        .map((chunk) => `${chunk.metadata.text}`)
        .join("\n\n");
    
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
      
      // Retrieve top 10 relevant chunks from Pinecone
      const relevantChunks = await this.queryPinecone(embedding);
      
      // If no relevant chunks found
      if (relevantChunks.length === 0) {
        return new BadRequestException("I couldn't find any relevant information to answer your question.");
      }
      
      // Generate answer using Gemini with retrieved chunks as context
      const answer = await this.queryGemini(query, nameUser, userInfo, relevantChunks);
      
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
        Generate a personalized 7-day ${variant} plan for a user with the following information:
        
        User Information:
        ${userInfo}
        
        Past Experiences:
        ${pastExperiences}
        
        Instructions:
        ${isPlanWorkout 
          ? '- Create a balanced workout routine for 7 days\n- Include exercise names, sets, reps, and rest periods\n- Provide variations based on fitness level' 
          : '- Create a balanced meal plan for 7 days\n- Include today\'s complete meals with ingredients and simple preparation instructions\n- Consider dietary restrictions and nutritional balance'
        }
        
        Response Format:
        Return a valid JSON object with the following structure:
        {
          "day1": { "plan": "Detailed plan for day 1 in markdown format" },
          "day2": { "plan": "Detailed plan for day 2 in markdown format" },
          ...and so on for all 7 days
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
