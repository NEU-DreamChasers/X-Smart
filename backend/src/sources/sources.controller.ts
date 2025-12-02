import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { DataSource } from './entities/data-source.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import type { Response } from 'express';

@ApiTags('Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  // --- TẠO MỚI ---
  @Post()
  @Roles(UserRole.ADMIN)
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
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nguồn dữ liệu (Hỗ trợ phân trang/lấy tất cả)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Res({ passthrough: true }) res?: Response
  ) {
    const [data, count] = await this.sourcesService.findAll(limit, offset);

    if (res) {
      res.header('X-Total-Count', count.toString());
    }

    return data;
  }

  // --- LẤY CHI TIẾT --- 
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Xem chi tiết một nguồn theo ID (Read One)' })
  @ApiParam({ name: 'id', description: 'ID của nguồn dữ liệu (UUID)' })
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }

  // --- CẬP NHẬT ---
  @Patch(':id')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa bỏ một nguồn dữ liệu (Delete)' })
  @ApiParam({ name: 'id', description: 'ID của nguồn cần xóa' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(id);
  }
}
