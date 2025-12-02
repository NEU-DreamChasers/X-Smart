import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { User, UserRole } from 'src/users/user.entity';
import { UpdateReportDto } from './dto/update-report.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ReportFilterDto } from './dto/report-filter.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
    private httpService: HttpService,
    private notificationsService: NotificationsService,
  ) { }

  private async getAddressFromCoordinates(lat: number, lon: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'X-Smart-City-App/1.0' }
        })
      );

      // Trả về tên hiển thị đầy đủ
      return response.data.display_name || 'Địa chỉ không xác định';
    } catch (error) {
      this.logger.error('Lỗi lấy địa chỉ từ OSM:', error.message);
      return 'Không thể lấy địa chỉ tự động'; // Fallback nếu lỗi mạng
    }
  }


  private async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, { // API trả về mảng
          headers: { 'User-Agent': 'X-Smart-City-App/1.0' }
        })
      );

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      }
      throw new Error('Không tìm thấy tọa độ');
    } catch (error) {
      this.logger.error('Lỗi tìm tọa độ:', error.message);
      return null;
    }
  }

  async create(dto: CreateReportDto, user: User | null) {

    if (!user && !dto.guestPhone) {
      throw new BadRequestException('Bạn chưa đăng nhập, vui lòng để lại SĐT để chúng tôi liên hệ!');
    }


    if (dto.lat && dto.lon && !dto.address) {
      this.logger.log(`Đang tìm địa chỉ cho tọa độ: ${dto.lat}, ${dto.lon}`);
      dto.address = await this.getAddressFromCoordinates(dto.lat, dto.lon);
    }

    if (dto.address && (!dto.lat || !dto.lon)) {
      this.logger.log(`Đang tìm tọa độ cho địa chỉ: ${dto.address}`);
      const coords = await this.getCoordinatesFromAddress(dto.address);

      if (coords) {
        dto.lat = coords.lat;
        dto.lon = coords.lon;
      } else {
        throw new BadRequestException('Không tìm thấy vị trí của địa chỉ này, vui lòng chọn trên bản đồ!');
      }
    }
    if (!dto.lat || !dto.lon) {
      throw new BadRequestException('Vui lòng chọn vị trí trên bản đồ hoặc nhập địa chỉ cụ thể!');
    }

    const report = this.reportRepo.create({
      ...dto,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat]
      },

      status: ReportStatus.PENDING,
      user: user,
      guestName: user ? user.fullName : (dto.guestName || 'Ẩn danh'),
      guestPhone: user ? null : dto.guestPhone,

    } as any);

    return this.reportRepo.save(report);
  }
  // 2. Lấy tin đã duyệt
  async findAllApproved() {
    return this.reportRepo.find({
      where: { status: ReportStatus.APPROVED },
      relations: ['user'],
      select: {
        user: { id: true, fullName: true, avatar: true }
      },
      order: { createdAt: 'DESC' }
    });
  }

  // 3. Admin xem tất cả 
  async findAllAdmin(filter: ReportFilterDto) {
    const { page = 1, limit = 10, status, search } = filter;
    const skip = (page - 1) * limit;

    const query = this.reportRepo.createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .orderBy('report.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      query.andWhere('report.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(report.title ILIKE :search OR report.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // 4. Admin duyệt/từ chối 
  async updateStatus(id: number, status: ReportStatus) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new Error('Report not found');

    report.status = status;
    await this.reportRepo.save(report);

    let title = '';
    let message = '';

    if (status === ReportStatus.APPROVED) { 
      title = 'Báo cáo được tiếp nhận';
      message = `Phản ánh "${report.title}" của bạn đã được duyệt và đang xử lý.`;
    } else if (status === ReportStatus.REJECTED) {
      title = 'Báo cáo bị từ chối';
      message = `Phản ánh "${report.title}" chưa hợp lệ. Vui lòng kiểm tra lại.`;
    } else if (status === ReportStatus.RESOLVED) {
      title = 'Xử lý hoàn tất';
      message = `Vấn đề "${report.title}" bạn phản ánh đã được giải quyết!`;
    }

    if (title) {
      await this.notificationsService.create(report.userId, title, message, report.id.toString());
    }

    return report;
  }
  private async findAndCheckOwner(id: number, user: User) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['user']
    });

    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');

    if (user.role === UserRole.ADMIN) return report;

    if (!report.user || report.user.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền can thiệp vào báo cáo này');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new ForbiddenException('Không thể sửa/xóa báo cáo đã được xử lý');
    }

    return report;
  }

  // 5. Sửa báo cáo
  async update(id: number, dto: UpdateReportDto, user: User) {
    const report = await this.findAndCheckOwner(id, user);

    Object.assign(report, dto);

    report.status = ReportStatus.PENDING;

    return this.reportRepo.save(report);
  }

  // 6. Xóa báo cáo
  async remove(id: number, user: User) {
    const report = await this.findAndCheckOwner(id, user);
    return this.reportRepo.remove(report);
  }

  async getStats() {
    // 1. Thống kê theo Trạng thái
    const statusStats = await this.reportRepo
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(report.id)', 'count')
      .groupBy('report.status')
      .getRawMany();

    // 2. Thống kê tổng số
    const total = await this.reportRepo.count();

    return {
      totalReports: total,
      byStatus: statusStats.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      }))
    };
  }


  // Lấy báo cáo của user
  async findAllByUser(userId: number) {
    return this.reportRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }


  async findOne(id: number, user: User | null) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['user']
    });

    if (!report) throw new NotFoundException('Báo cáo không tồn tại');

    if (user?.role === UserRole.ADMIN) return report;

    if (user && report.user?.id === user.id) return report;

    if ([ReportStatus.APPROVED, ReportStatus.RESOLVED].includes(report.status)) {
      return report;
    }

    throw new ForbiddenException('Bạn không có quyền xem báo cáo này');
  }
}