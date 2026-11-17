import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Libera o front Angular (porta 4200) a chamar a API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
