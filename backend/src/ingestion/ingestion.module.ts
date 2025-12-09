/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
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
import { HistoryModule } from 'src/history/history.module';
import { MonitorService } from './monitor.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MonitorController } from './monitor.controller';
import { Min } from 'class-validator';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ScorpioModule,
    SourcesModule,
    HistoryModule,
    ConfigModule,
    NotificationsModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
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
  providers: [IngestionService, AdapterFactory, OpenWeatherMapAdapter, AirQualityAdapter, OverpassAdapter, MonitorService,],
  controllers: [DataProcessor, ContextController, MonitorController],
})
export class IngestionModule { }
