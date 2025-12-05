/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, Query, UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ReportsService } from './reports.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportStatus } from './entities/report.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly minioService: MinioClientService,
  ) { }

  // --- 1. PUBLIC API  ---
  @Public()
  @Get('public')
  getPublicReports() {
    return this.reportsService.findAllApproved();
  }

  // --- 2. GỬI BÁO CÁO ---
  @Public()
  @UseGuards(OptionalJwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateReportDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        throw new BadRequestException('Chỉ chấp nhận file ảnh!');
      }
      const uploadResult = await this.minioService.uploadFile(file);
      dto.imageUrl = uploadResult.url;
    }

    return this.reportsService.create(dto, req.user);
  }

  // --- 3. TIỆN ÍCH USER (Xem bài mình, sửa, xóa) ---

  @UseGuards(JwtAuthGuard)
  @Get('my-reports')
  getMyReports(@Req() req) {
    return this.reportsService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReportDto, @Req() req) {
    return this.reportsService.update(+id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.reportsService.remove(+id, req.user);
  }

  // --- 4. ADMIN DASHBOARD (Quản lý) ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllReports(@Query() filter: ReportFilterDto) {
    return this.reportsService.findAllAdmin(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reportsService.updateStatus(+id, ReportStatus.APPROVED);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.reportsService.updateStatus(+id, ReportStatus.REJECTED);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.reportsService.updateStatus(+id, ReportStatus.RESOLVED);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/stats')
  getStats() {
    return this.reportsService.getStats();
  }

  // --- 5. CHI TIẾT BÁO CÁO (Đặt cuối cùng) ---
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.reportsService.findOne(+id, req.user);
  }
}