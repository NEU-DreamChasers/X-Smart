/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SourcesService } from '../sources/sources.service';
import { ScorpioService } from '../scorpio/scorpio.service';
import { HistoryService } from '../history/history.service';
import { raw } from 'express';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly openWeatherApiKey: string;
  private readonly overpassUrl: string;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly httpService: HttpService,
    private readonly sourcesService: SourcesService,
    private readonly configService: ConfigService,
    private readonly scorpioService: ScorpioService,
    private readonly historyService: HistoryService,
  ) {
    const key = this.configService.get<string>('OPENWEATHER_API_KEY');
    this.overpassUrl = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';

    if (!key || key.trim() === '') {
      throw new Error(' LỖI CẤU HÌNH: Chưa tìm thấy OPENWEATHER_API_KEY!');
    }
    this.openWeatherApiKey = key || '';
  }

  // LUỒNG 1: THU THẬP CẢM BIẾN (Weather/Air) - Chạy 5 phút/lần
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleSensorIngestion() {
    this.logger.debug('📡 [Ingestion] Đang thu thập dữ liệu Môi trường...');
    
    const [allSources] = await this.sourcesService.findAll();
    const sources = allSources.filter(s => 
      s.isActive === true && 
      (s.adapterType === 'openweathermap' || s.adapterType === 'openweathermap_aqi')
    );

    for (const source of sources) {
      try {
        let apiUrl = '';
        let entityId = '';

        if (source.adapterType === 'openweathermap') {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}&units=metric`;
        } 
        else if (source.adapterType === 'openweathermap_aqi') {
          apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}`;
        } 
        else {
            continue; 
        }

        const response = await firstValueFrom(this.httpService.get(apiUrl));
        const rawData = response.data;

        // --- GỬI KAFKA (Cho Scorpio cập nhật hiện tại) ---
        this.kafkaClient.emit('raw_data_topic', {
          sourceType: source.adapterType,
          payload: rawData,
        });

        // --- LƯU LỊCH SỬ ---
        if (source.adapterType === 'openweathermap') {
             const owmId = rawData.id || rawData.name; 
             entityId = `urn:ngsi-ld:WeatherObserved:OpenWeatherMap:${owmId}`;
        } else {
             const lat = Number(source.latitude).toFixed(4);
             const lon = Number(source.longitude).toFixed(4);
             entityId = `urn:ngsi-ld:AirQualityObserved:AirQuality:Lat${lat}_Lon${lon}`;
        }
        if (entityId) {
            await this.historyService.saveHistoryFromRaw(entityId, source.adapterType, rawData);
        }

        await new Promise((r) => setTimeout(r, 3000));

      } catch (error) {
        const err = error as Error;
        this.logger.error(`Lỗi nguồn ${source.name}: ${err.message}`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  // LUỒNG 2: GIẢ LẬP BÃI ĐỖ XE - Chạy 1 phút/lần
  @Cron(CronExpression.EVERY_MINUTE)
  async handleParkingSimulation() {
    this.logger.log(' [Simulation] Đang cập nhật trạng thái bãi đỗ xe...');

    const result = await this.scorpioService.getEntitiesByType('OffStreetParking');
    const parkingLots = result.data;

    if (!parkingLots || parkingLots.length === 0) return;

    for (const lot of parkingLots) {
      const total = lot.totalSpotNumber?.value || 50;
      const hour = new Date().getHours();

      const isPeak = hour >= 8 && hour <= 18;
      const baseOccupancy = isPeak ? 0.8 : 0.2;
      const randomVar = Math.random() * 0.2;
      const occupancyRate = baseOccupancy + randomVar;

      const occupied = Math.floor(total * Math.min(occupancyRate, 1));
      const available = Math.max(0, total - occupied);

      const updatePayload = {
        id: lot.id,
        type: 'OffStreetParking',
        availableSpotNumber: { type: 'Property', value: available, observedAt: new Date().toISOString() },
        occupancy: { type: 'Property', value: parseFloat(occupancyRate.toFixed(2)) },
      };

      await this.scorpioService.publishEntity(updatePayload as any);
    }
    this.logger.log(` Đã cập nhật trạng thái cho ${parkingLots.length} bãi xe.`);
  }

  // LUỒNG 3: IMPORT DỮ LIỆU TĨNH
  async importStaticCityData(category: string) {
    this.logger.log(`🏗️ Bắt đầu Import toàn thành phố cho: ${category}...`);

    const bbox = '10.37,106.34,11.16,107.02';
    let query = '';
    let adapterType = '';

    if (category === 'bus') {
      query = `[out:json][timeout:180];node["highway"="bus_stop"](${bbox});out;`;
      adapterType = 'overpass_bus';
    } else if (category === 'parking') {
      query = `[out:json][timeout:180];(node["amenity"="parking"](${bbox});way["amenity"="parking"](${bbox}););out center;`;
      adapterType = 'overpass_parking';
    } else {
      query = `[out:json][timeout:180];node["amenity"](${bbox});out;`;
      adapterType = 'overpass_poi';
    }

    const apiUrl = `${this.overpassUrl}?data=${encodeURIComponent(query)}`;

    const response = await firstValueFrom(this.httpService.get(apiUrl));
    const elements = response.data.elements || [];
    this.logger.log(` Tìm thấy ${elements.length} điểm. Đang đẩy vào Kafka...`);

    for (const element of elements) {
      this.kafkaClient.emit('raw_data_topic', {
        sourceType: adapterType,
        payload: element,
      });
    }
    return { count: elements.length, status: 'Processing' };
  }
}
