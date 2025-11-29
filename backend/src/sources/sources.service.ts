import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from './entities/data-source.entity';

@Injectable()
export class SourcesService implements OnModuleInit {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    @InjectRepository(DataSource)
    private dataSourceRepo: Repository<DataSource>,
  ) {}

  // --- HÀM TỰ ĐỘNG CHẠY KHI KHỞI ĐỘNG ---
  async onModuleInit() {
    await this.seedDefaultSources();
  }

  async seedDefaultSources() {
    const count = await this.dataSourceRepo.count();
    if (count > 0) {
      this.logger.log('Database đã có dữ liệu. Bỏ qua bước Seeding.');
      return;
    }

    this.logger.log('⚡ Đang khởi tạo hệ thống giám sát Smart City (TP. Hồ Chí Minh)...');

    // Danh sách các điểm quan trắc tại TP.HCM
    const hcmLocations = [
      // --- Khu Trung Tâm ---
      { name: 'District 1 (Ben Thanh Market)', lat: 10.7721, lon: 106.6983 },
      { name: 'District 3 (Turtle Lake)', lat: 10.7827, lon: 106.6959 },
      { name: 'District 4 (Khanh Hoi)', lat: 10.7623, lon: 106.7074 },

      // --- Khu Đô Thị Mới / Cao Cấp ---
      { name: 'Binh Thanh (Landmark 81)', lat: 10.7952, lon: 106.7218 },
      { name: 'District 7 (Phu My Hung)', lat: 10.7327, lon: 106.7069 },
      { name: 'Thu Duc City (Thao Dien)', lat: 10.8034, lon: 106.7385 },

      // --- Khu Dân Cư Đông Đúc / Giao Thương ---
      { name: 'District 5 (Cho Lon)', lat: 10.7548, lon: 106.6662 },
      { name: 'District 10', lat: 10.7727, lon: 106.6695 },
      { name: 'Go Vap District', lat: 10.8386, lon: 106.6653 },

      // --- Khu Công Nghiệp / Cửa Ngõ ---
      { name: 'Tan Binh (TSN Airport)', lat: 10.8185, lon: 106.6588 },
      { name: 'Binh Tan (Aeon Mall)', lat: 10.7607, lon: 106.6111 },
      { name: 'Thu Duc (High Tech Park)', lat: 10.8547, lon: 106.8033 },
      { name: 'District 12 (Software Park)', lat: 10.8567, lon: 106.6286 },
    ];

    const newSources: DataSource[] = [];

    for (const location of hcmLocations) {
      // Trạm Thời tiết
      newSources.push(
        this.dataSourceRepo.create({
          name: `Weather - ${location.name}`,
          adapterType: 'openweathermap',
          latitude: location.lat,
          longitude: location.lon,
          isActive: true,
        }),
      );

      // Trạm Chất lượng không khí
      newSources.push(
        this.dataSourceRepo.create({
          name: `Air Monitor - ${location.name}`,
          adapterType: 'openweathermap_aqi',
          latitude: location.lat,
          longitude: location.lon,
          isActive: true,
        }),
      );
    }

    await this.dataSourceRepo.save(newSources);
    this.logger.log(`✅ Đã lắp đặt ${newSources.length} cảm biến ảo phủ kín TP.HCM!`);
  }

  // --- CÁC HÀM CRUD CHO NGUỒN DỮ LIỆU ---

  create(data: Partial<DataSource>) {
    const newSource = this.dataSourceRepo.create(data);
    return this.dataSourceRepo.save(newSource);
  }

  findAll() {
    return this.dataSourceRepo.find();
  }

  async findOne(id: string) {
    const source = await this.dataSourceRepo.findOne({ where: { id } });
    if (!source) throw new NotFoundException(`Không tìm thấy nguồn có ID: ${id}`);
    return source;
  }

  async update(id: string, changes: Partial<DataSource>) {
    const source = await this.findOne(id);
    this.dataSourceRepo.merge(source, changes);
    return this.dataSourceRepo.save(source);
  }

  async remove(id: string) {
    const source = await this.findOne(id);
    return this.dataSourceRepo.remove(source);
  }
}
