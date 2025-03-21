import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProcessQueryRequestBodyDto } from './dtos/process-query-request-body.dto';
import { GeneratePlanRequestBodyDto } from './dtos/generate-plan-request-body.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/process-query")
  @HttpCode(200)
  async postProcessQuery(@Body() body: ProcessQueryRequestBodyDto) {
    console.log(body);
    return this.appService.processQuery(body.nameUser, body.userInfo, body.query);
  }

  @Post('generate-plan')
  async generatePlan(@Body() body: GeneratePlanRequestBodyDto) {
    return this.appService.generatePlan(body.variant, body.userInfo, body.pastExperiences);
  }
}
