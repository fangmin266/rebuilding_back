import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { BaseAPIDocument } from './config/swagger.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({});
  const config = new BaseAPIDocument().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalInterceptors(new TransformInterceptor()); //interceptor 전역화
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); //exclude 전역화
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));

  await app.listen(3600);
}
bootstrap();
