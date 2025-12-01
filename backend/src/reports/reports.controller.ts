import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from './entities/report.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/users/user.entity';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { Throttle } from '@nestjs/throttler'; // Import Decorator

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  // 1. PUBLIC: Lấy danh sách hiển thị lên Map (Chỉ lấy tin đã duyệt)
  @Public()
  @Get('public')
  getPublicReports() {
    return this.reportsService.findAllApproved();
  }

  // 2. Gửi báo cáo (Dân hoặc Khách)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReportDto, @Req() req) {
    return this.reportsService.create(dto, req.user);
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
  // --- ADMIN ---

  // 3. Xem tất cả đơn (để duyệt)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllReports(@Query() filter: ReportFilterDto) {
    return this.reportsService.findAllAdmin(filter);
  }

  // 4. Duyệt đơn (Approve)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reportsService.updateStatus(+id, ReportStatus.APPROVED);
  }

  // 5. Từ chối đơn (Reject)
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

  // --- USER TIỆN ÍCH ---

  // 6. Xem danh sách báo cáo CỦA TÔI
  @UseGuards(JwtAuthGuard)
  @Get('my-reports')
  getMyReports(@Req() req) {
    return this.reportsService.findAllByUser(req.user.id);
  }

  // 7. Xem chi tiết 1 báo cáo
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.reportsService.findOne(+id, req.user);
  }
}