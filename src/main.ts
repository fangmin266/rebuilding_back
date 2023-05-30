import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { BaseAPIDocument } from './config/swagger.document';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.enableCors({});
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  const config = new BaseAPIDocument().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter()); //모든 에러는 형식
  app.useGlobalInterceptors(new TransformInterceptor()); //interceptor 전역화

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); //exclude 전역화
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
  await app.listen(3600);
}
bootstrap();
