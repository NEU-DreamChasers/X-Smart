import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, HttpException, HttpStatus } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

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
}