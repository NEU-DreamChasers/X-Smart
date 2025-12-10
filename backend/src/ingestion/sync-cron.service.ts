/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm'; 
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DataSource } from '../sources/entities/data-source.entity';
import { ScorpioService } from '../scorpio/scorpio.service';
import { AdapterFactory } from './factory/adapter.factory';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(
    @InjectRepository(DataSource)
    private dataSourceRepo: Repository<DataSource>,
    private httpService: HttpService,
    private scorpioService: ScorpioService,
    private adapterFactory: AdapterFactory,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.log('⏳ [CRON] Bắt đầu quét dữ liệu môi trường (Weather & AQI)...');

    // 1. Lấy danh sách trạm từ DB mà có adapterType là 'openweathermap' HOẶC 'openweathermap_aqi'
    const sources = await this.dataSourceRepo.find({
      where: { 
        isActive: true, 
        adapterType: In(['openweathermap', 'openweathermap_aqi']) 
      },
    });

    if (sources.length === 0) {
      this.logger.warn('⚠️ Không tìm thấy trạm nào cần cập nhật.');
      return;
    }

    const apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');
    if (!apiKey) {
      this.logger.error('❌ Thiếu API Key trong file .env');
      return;
    }

    // 2. Duyệt qua từng trạm
    for (const source of sources) {
      try {
        let url = '';
        let entityTypePrefix = '';

        // --- A. PHÂN LOẠI API ---
        if (source.adapterType === 'openweathermap') {
          url = `https://api.openweathermap.org/data/2.5/weather?lat=${source.latitude}&lon=${source.longitude}&units=metric&appid=${apiKey}`;
          entityTypePrefix = 'WeatherObserved';
        
        } else if (source.adapterType === 'openweathermap_aqi') {
          url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${source.latitude}&lon=${source.longitude}&appid=${apiKey}`;
          entityTypePrefix = 'AirQualityObserved';
        }

        // --- B. GỌI API ---
        const response = await firstValueFrom(this.httpService.get(url));
        const rawData = response.data;
        rawData.name = source.name; 

        // --- C. CONVERT DỮ LIỆU ---
        const adapter = this.adapterFactory.getAdapter(source.adapterType);
        const ngsiEntity = await adapter.convert(rawData);

        // --- D. GÁN ID CHUẨN ---
        ngsiEntity.id = `urn:ngsi-ld:${entityTypePrefix}:${source.name}`;

        // --- E. ĐẨY LÊN SCORPIO ---
        await this.scorpioService.publishEntity(ngsiEntity);
        
        this.logger.debug(`✅ Sync OK [${source.adapterType}]: ${source.name}`);

      } catch (error) {
        this.logger.error(`❌ Lỗi tại trạm ${source.name}: ${error.message}`);
      }
    }

    this.logger.log(' Hoàn tất chu kỳ. Chờ 5 phút tiếp theo...');
  }
}