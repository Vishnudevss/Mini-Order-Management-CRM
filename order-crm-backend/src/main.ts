import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true }); // rawBody is needed for webhook signatures
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();