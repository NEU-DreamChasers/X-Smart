/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Controller, Get, Query } from '@nestjs/common';
import { FloodService } from './flood.service';

@Controller('flood')
export class FloodController {
  constructor(private readonly floodService: FloodService) {}

  @Get('layer')
  getFloodLayer() { return this.floodService.getFloodLayerUrl().then(url => ({ url })); }

  @Get('satellite')
  getSatelliteLayer() { return this.floodService.getSatelliteLayerUrl().then(url => ({ url })); }

  @Get('check')
  checkPoint(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.floodService.checkFloodAtCoordinate(lat, lon);
  }
}