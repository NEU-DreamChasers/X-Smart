/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SourcesModule } from './sources/sources.module';
import { ScorpioModule } from './scorpio/scorpio.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { HistoryModule } from './history/history.module';
import { ReportsModule } from './reports/reports.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get<string>('DB_USERNAME') || 'ngb',
        password: config.get<string>('DB_PASSWORD') || 'ngb',
        database: config.get<string>('DB_DATABASE') || 'ngb',
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),

    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    SourcesModule,
    ScorpioModule,
    IngestionModule,
    HistoryModule,
    ReportsModule,
    MinioClientModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
