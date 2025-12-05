/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe, HttpException, HttpStatus } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // GET /history/chart?entityId=...&attr=temperature&hours=24
  @Get('chart')
  @ApiOperation({ summary: 'Lấy dữ liệu lịch sử để vẽ biểu đồ' })
  @ApiQuery({ name: 'entityId', required: true, description: 'ID của cảm biến (URN)' })
  @ApiQuery({ name: 'attr', required: true, description: 'Thuộc tính (temperature, humidity, pm25...)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Số giờ quá khứ (Mặc định 24)' })
  async getChart(
    @Query('entityId') entityId: string,
    @Query('attr') attr: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    try {
      const decodedId = decodeURIComponent(entityId);
      
      return await this.historyService.getChartData(decodedId, attr, hours);
    } catch (error) {
      throw new HttpException('Lỗi lấy dữ liệu lịch sử', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /history/chart/temperature/:location?hours=24
  @Get('chart/temperature/:location')
  @ApiOperation({ summary: 'Biểu đồ nhiệt độ theo địa điểm' })
  @ApiParam({ name: 'location', description: 'Tên địa điểm (VD: Ho Chi Minh City)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Số giờ (mặc định 24)' })
  async getTemperatureChart(
    @Param('location') location: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    try {
      return await this.historyService.getTemperatureChartData(location, hours);
    } catch (error) {
      throw new HttpException('Lỗi lấy dữ liệu nhiệt độ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /history/chart/aqi/:location?hours=24
  @Get('chart/aqi/:location')
  @ApiOperation({ summary: 'Biểu đồ chất lượng không khí (AQI/PM2.5)' })
  @ApiParam({ name: 'location', description: 'Tên địa điểm (VD: Ho Chi Minh City)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Số giờ (mặc định 24)' })
  async getAQIChart(
    @Param('location') location: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    try {
      return await this.historyService.getAQIChartData(location, hours);
    } catch (error) {
      throw new HttpException('Lỗi lấy dữ liệu AQI', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /history/chart/precipitation/:location?hours=24
  @Get('chart/precipitation/:location')
  @ApiOperation({ summary: 'Biểu đồ lượng mưa' })
  @ApiParam({ name: 'location', description: 'Tên địa điểm (VD: Ho Chi Minh City)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Số giờ (mặc định 24)' })
  async getPrecipitationChart(
    @Param('location') location: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    try {
      return await this.historyService.getPrecipitationChartData(location, hours);
    } catch (error) {
      throw new HttpException('Lỗi lấy dữ liệu lượng mưa', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}