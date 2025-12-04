/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { SensorHistory } from './entities/sensor-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([SensorHistory])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
