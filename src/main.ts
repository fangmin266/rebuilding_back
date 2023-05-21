import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('rebuilding_back')
    .setDescription('cloudfunding_rebuilding')
    .setVersion('1.0')
    .addTag('clound funding rebuilding backend project')
    .build();

  // const httpsOptions = {
  //   key: fs.readFileSync('./cert/key.pem'),
  //   cert: fs.readFileSync('./cert/cert.pem'), //에러 생김 : 파일 위치 문제였음 ^^;
  // };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalInterceptors(new TransformInterceptor()); //interceptor 전역화
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); //exclude 전역화
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
  app.enableCors();
  await app.listen(3600);
}
bootstrap();
