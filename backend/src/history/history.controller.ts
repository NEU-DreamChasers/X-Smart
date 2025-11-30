import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('entities/:type')
  @ApiOperation({ summary: 'Lấy danh sách entities có lịch sử theo type' })
  @ApiParam({
    name: 'type',
    example: 'WeatherObserved',
    description: 'Loại entity (WeatherObserved, AirQualityObserved, etc.)',
  })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng kết quả tối đa' })
  @ApiResponse({ status: 200, description: 'Danh sách entities có lịch sử' })
  getEntitiesByType(@Param('type') type: string, @Query('limit') limit?: number) {
    return this.historyService.getEntitiesByType(type, limit || 10);
  }

  @Get('entities/:entityId/attrs/:attrName')
  @ApiOperation({ summary: 'Lấy lịch sử của một thuộc tính cụ thể' })
  @ApiParam({
    name: 'entityId',
    example: 'urn:ngsi-ld:WeatherObserved:OpenWeatherMap:1566083',
    description: 'ID đầy đủ của entity',
  })
  @ApiParam({
    name: 'attrName',
    example: 'temperature',
    description: 'Tên attribute (temperature, humidity, pm25, etc.)',
  })
  @ApiQuery({ name: 'lastN', required: false, example: 20, description: 'Lấy N bản ghi gần nhất' })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    example: '2025-11-01T00:00:00Z',
    description: 'Từ thời gian (ISO 8601)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    example: '2025-11-30T23:59:59Z',
    description: 'Đến thời gian (ISO 8601)',
  })
  @ApiResponse({ status: 200, description: 'Lịch sử giá trị của thuộc tính' })
  getAttributeHistory(
    @Param('entityId') entityId: string,
    @Param('attrName') attrName: string,
    @Query('lastN') lastN?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.historyService.getAttributeHistory(entityId, attrName, { lastN, fromDate, toDate });
  }

  @Get('weather/:location')
  @ApiOperation({ summary: 'Lấy lịch sử thời tiết của một địa điểm' })
  @ApiParam({ name: 'location', example: '1566083', description: 'ID location (OpenWeatherMap ID)' })
  @ApiQuery({ name: 'lastN', required: false, example: 24, description: 'Số giờ gần nhất (mặc định 24h)' })
  @ApiResponse({ status: 200, description: 'Lịch sử thời tiết với temperature, humidity, pressure' })
  getWeatherHistory(@Param('location') location: string, @Query('lastN') lastN?: number) {
    const entityId = `urn:ngsi-ld:WeatherObserved:OpenWeatherMap:${location}`;
    return this.historyService.getWeatherHistory(entityId, lastN || 24);
  }

  @Get('air/:location')
  @ApiOperation({ summary: 'Lấy lịch sử chất lượng không khí của một địa điểm' })
  @ApiParam({ name: 'location', example: 'Lat10.7721_Lon106.6983', description: 'ID location' })
  @ApiQuery({ name: 'lastN', required: false, example: 24, description: 'Số giờ gần nhất' })
  @ApiResponse({ status: 200, description: 'Lịch sử AQI với pm25, pm10, CO, NO2, O3, SO2' })
  getAirQualityHistory(@Param('location') location: string, @Query('lastN') lastN?: number) {
    const entityId = `urn:ngsi-ld:AirQualityObserved:OpenWeatherMap:AirQuality:${location}`;
    return this.historyService.getAirQualityHistory(entityId, lastN || 24);
  }

  @Get('chart/temperature/:location')
  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ nhiệt độ' })
  @ApiParam({ name: 'location', example: '1566083' })
  @ApiQuery({ name: 'hours', required: false, example: 24, description: 'Số giờ lịch sử' })
  @ApiResponse({
    status: 200,
    description: 'Format cho Chart.js/Recharts',
    schema: {
      example: {
        labels: ['2025-11-28 10:00', '2025-11-28 11:00'],
        datasets: [{ label: 'Temperature (°C)', data: [22.5, 23.1] }],
      },
    },
  })
  getTemperatureChart(@Param('location') location: string, @Query('hours') hours?: number) {
    return this.historyService.getTemperatureChartData(location, hours || 24);
  }

  @Get('chart/aqi/:location')
  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ AQI' })
  @ApiParam({ name: 'location', example: 'Lat10.7721_Lon106.6983' })
  @ApiQuery({ name: 'hours', required: false, example: 24 })
  @ApiResponse({ status: 200, description: 'Format cho Chart.js/Recharts' })
  getAQIChart(@Param('location') location: string, @Query('hours') hours?: number) {
    return this.historyService.getAQIChartData(location, hours || 24);
  }

  @Get('chart/precipitation/:location')
  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ lượng mưa' })
  @ApiParam({ name: 'location', example: '1566083', description: 'ID location (OpenWeatherMap ID)' })
  @ApiQuery({ name: 'hours', required: false, example: 24, description: 'Số giờ lịch sử' })
  @ApiResponse({
    status: 200,
    description: 'Format cho Chart.js/Recharts - Biểu đồ cột (Bar Chart)',
    schema: {
      example: {
        labels: ['10:00', '11:00', '12:00'],
        datasets: [{ label: 'Lượng mưa (mm)', data: [0, 0.5, 1.2] }],
      },
    },
  })
  getPrecipitationChart(@Param('location') location: string, @Query('hours') hours?: number) {
    return this.historyService.getPrecipitationChartData(location, hours || 24);
  }
}
