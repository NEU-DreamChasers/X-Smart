/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Module } from '@nestjs/common';
import { FloodService } from './flood.service';
import { FloodController } from './flood.controller';

@Module({
  controllers: [FloodController],
  providers: [FloodService],
})
export class FloodModule {}