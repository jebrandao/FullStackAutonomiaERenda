import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  status() {
    return { app: 'meu-primero-app-api', status: 'ok' };
  }
}
