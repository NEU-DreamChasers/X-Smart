import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Delete } from '@nestjs/common';
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
  getAllReports() {
    return this.reportsService.findAllAdmin();
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
}