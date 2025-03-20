import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/process-query")
  postProcessQuery(@Body() body): string {
    console.log(body);
    return this.appService.processQuery(body.nameUser, body.userInfo);
  }
}
