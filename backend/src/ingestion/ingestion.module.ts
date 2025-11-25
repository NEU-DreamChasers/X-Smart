// src/ingestion/ingestion.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { ScorpioModule } from '../scorpio/scorpio.module';
import { SourcesModule } from '../sources/sources.module';
import { IngestionService } from './ingestion.service';
import { DataProcessor } from './data.processor';
import { AdapterFactory } from './factory/adapter.factory';
import { ContextController } from './context.controller';
import { OpenWeatherMapAdapter } from './strategies/openweathermap.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AirQualityAdapter } from './strategies/air-quality.adapter';
import { OverpassAdapter } from './strategies/overpass.adapter';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ScorpioModule,
    SourcesModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              // Đọc từ biến môi trường, nếu không có thì fallback về localhost (cho Dev)
              brokers: [configService.get<string>('KAFKA_BROKER') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'ingestion-producer-group',
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [IngestionService, AdapterFactory, OpenWeatherMapAdapter, AirQualityAdapter, OverpassAdapter],
  controllers: [DataProcessor, ContextController], // Đăng ký Consumer như một Controller
})
export class IngestionModule {}
