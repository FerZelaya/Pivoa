import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for web app
  const webOrigin = configService.get<string>('WEB_ORIGIN', 'http://localhost:5173');
  app.enableCors({
    origin: webOrigin,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}`);
}
await bootstrap();
