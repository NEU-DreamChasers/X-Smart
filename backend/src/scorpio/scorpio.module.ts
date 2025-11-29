import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScorpioService } from './scorpio.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ScorpioService],
  exports: [ScorpioService],
})
export class ScorpioModule {}
