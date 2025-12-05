/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SensorHistory } from './entities/sensor-history.entity';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(SensorHistory)
    private historyRepo: Repository<SensorHistory>,
  ) {}

  // --- 1. HÀM GHI: Lưu dữ liệu từ Ingestion vào DB ---
  async saveHistoryFromRaw(entityId: string, type: string, rawData: any) {
    try {
      const records: Partial<SensorHistory>[] = [];
      
      if (type.includes('openweathermap') && !type.includes('aqi')) {
        if (rawData.main?.temp !== undefined) 
            this.addRecord(records, entityId, 'temperature', rawData.main.temp);
        if (rawData.main?.humidity !== undefined) 
            this.addRecord(records, entityId, 'humidity', rawData.main.humidity);
        if (rawData.rain?.['1h'] !== undefined)
            this.addRecord(records, entityId, 'precipitation', rawData.rain['1h']);
      }

      if (type.includes('openweathermap_aqi')) {
        const components = rawData.list?.[0]?.components;
        const main = rawData.list?.[0]?.main;
        
        if (main?.aqi) this.addRecord(records, entityId, 'aqi', main.aqi);
        if (components?.pm2_5) this.addRecord(records, entityId, 'pm25', components.pm2_5);
        if (components?.co) this.addRecord(records, entityId, 'co', components.co);
      }

      if (type === 'OffStreetParking') {
         // Với Parking, rawData chính là payload update của bạn
         if (rawData.availableSpotNumber?.value !== undefined) {
             this.addRecord(records, entityId, 'availableSpotNumber', rawData.availableSpotNumber.value);
         }
      }

      if (records.length > 0) {
        await this.historyRepo.save(records);
      }

    } catch (error) {
      this.logger.error(`Lỗi lưu lịch sử: ${(error as any).message}`);
    }
  }

  // Helper để push vào mảng gọn hơn
  private addRecord(list: any[], entityId: string, name: string, value: any) {
    list.push({ entityId, attributeName: name, value: Number(value) });
  }


  // --- 2. HÀM ĐỌC: Lấy dữ liệu vẽ biểu đồ ---
  async getChartData(location: string, attrName: string, hours: number = 24) {
    let entityId = location;
    if (!location.startsWith('urn:ngsi-ld:')) {
       entityId = location; 
    }

    const since = new Date();
    since.setHours(since.getHours() - hours);

    const data = await this.historyRepo
      .createQueryBuilder('h')
      .select("date_trunc('hour', h.observedAt)", 'time')
      .addSelect('AVG(h.value)', 'value')                 
      .where('h.entityId = :entityId', { entityId })
      .andWhere('h.attributeName = :attrName', { attrName })
      .andWhere('h.observedAt > :since', { since })
      .groupBy('time')
      .orderBy('time', 'ASC')
      .getRawMany()

    return {
      labels: data.map((d) => {
        const date = new Date(d.time);
        return date.toLocaleString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          day: '2-digit', 
          month: '2-digit' 
        });
      }),
      datasets: [{
        label: attrName.toUpperCase(),
        data: data.map(d => d.value),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3
      }]
    };
  }
  
  async getTemperatureChartData(id: string, hours: number) {
      return this.getChartData(id, 'temperature', hours);
  }

  async getAQIChartData(id: string, hours: number) {
      return this.getChartData(id, 'pm25', hours);
  }

  async getPrecipitationChartData(id: string, hours: number) {
      return this.getChartData(id, 'precipitation', hours);
  }
}