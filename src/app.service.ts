import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  processQuery(nameUser: string, userInfo: string): string {
    return `Hello ${nameUser}, your info is ${userInfo}`;
  }
}
