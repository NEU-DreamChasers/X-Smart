// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('X-Smart City Platform')
    .setDescription('Hệ thống thu thập, chuẩn hóa và cung cấp dữ liệu IoT (Weather, Air, Traffic) theo chuẩn NGSI-LD.')
    .setVersion('1.0')
    .addTag('Ingestion', 'Các API nhập liệu và truy xuất dữ liệu ngữ cảnh')
    .addTag('Sources', 'Các API quản lý nguồn dữ liệu (Cảm biến/API)')

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
  console.log(`Swagger UI is available at: http://localhost:${port}/api/docs`);
  console.log(`Frontend is available at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}
bootstrap();
