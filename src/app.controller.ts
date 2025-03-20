import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProcessQueryRequestBodyDto } from './dtos/process-query-request-body.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/process-query")
  async postProcessQuery(@Body() body: ProcessQueryRequestBodyDto) {
    console.log(body);
    return this.appService.processQuery(body.nameUser, body.userInfo, body.query);
  }
}
