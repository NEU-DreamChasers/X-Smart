/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
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
