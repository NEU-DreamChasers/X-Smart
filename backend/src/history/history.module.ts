import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  imports: [HttpModule],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
