import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { DataSource } from './entities/data-source.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  // --- TẠO MỚI ---
  @Post()
  @ApiOperation({ summary: 'Thêm mới một nguồn dữ liệu (Create)' })
  @ApiBody({
    description: 'Thông tin nguồn dữ liệu',
    schema: { example: { name: 'New Station', adapterType: 'openweathermap', latitude: 21.0, longitude: 105.8 } },
  })
  create(@Body() data: Partial<DataSource>) {
    return this.sourcesService.create(data);
  }

  // --- LẤY DANH SÁCH ---
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nguồn dữ liệu (Read All)' })
  findAll() {
    return this.sourcesService.findAll();
  }

  // --- LẤY CHI TIẾT ---
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một nguồn theo ID (Read One)' })
  @ApiParam({ name: 'id', description: 'ID của nguồn dữ liệu (UUID)' })
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }

  // --- CẬP NHẬT ---
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nguồn dữ liệu (Update)' })
  @ApiParam({ name: 'id', description: 'ID của nguồn cần sửa' })
  @ApiBody({
    description: 'Thông tin cần sửa (Gửi trường nào sửa trường đó)',
    schema: { example: { isActive: false, name: 'Station Renamed' } },
  })
  update(@Param('id') id: string, @Body() changes: Partial<DataSource>) {
    return this.sourcesService.update(id, changes);
  }

  // --- XÓA ---
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bỏ một nguồn dữ liệu (Delete)' })
  @ApiParam({ name: 'id', description: 'ID của nguồn cần xóa' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(id);
  }
}
