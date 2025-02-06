import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
//추가사항
  app.enableCors({ 
    origin: '*', // ✅ 모든 도메인에서 접근 가능하도록 설정 (보안상 필요 시 특정 도메인만 허용)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // ✅ 허용할 HTTP 메서드 지정
  });

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
