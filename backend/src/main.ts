// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('X-Smart City Platform')
    .setDescription('Hệ thống thu thập, chuẩn hóa và cung cấp dữ liệu IoT (Weather, Air, Traffic) theo chuẩn NGSI-LD.')
    .setVersion('1.0')
    .addTag('Reports', 'API Báo cáo sự cố từ người dân')
    .addTag('Auth', 'API Xác thực và Phân quyền')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'ingestion-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api/docs`);
}
bootstrap();