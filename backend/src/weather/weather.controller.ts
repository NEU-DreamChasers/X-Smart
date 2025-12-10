/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}
  
// GET /weather/forecast?entityId=...
  @Get('forecast')
  @ApiOperation({ summary: 'Lấy dự báo thời tiết 5 ngày tới' })
  async getForecast(@Query('entityId') entityId: string) {
    return await this.weatherService.getForecast(entityId);
  }
}