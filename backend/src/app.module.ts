import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SourcesModule } from './sources/sources.module';
import { ScorpioModule } from './scorpio/scorpio.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
