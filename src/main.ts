import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const options = new DocumentBuilder()
    .setTitle('Your API Title')
    .addBearerAuth()
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer(process.env.BASE_URL || 'http://localhost:3000/', 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addBearerAuth()
    .addTag('Your API Tag')
    .addBearerAuth() // JWT 베어러 인증 추가
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
