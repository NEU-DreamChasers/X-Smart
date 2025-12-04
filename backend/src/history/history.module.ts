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
