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
    const [sources] = await this.sourcesService.findAll();

    for (const source of sources) {
      if (!source.adapterType.includes('openweathermap')) continue;

      try {
        let apiUrl = '';
        if (source.adapterType === 'openweathermap') {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}&units=metric`;
        } else {
          apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}`;
        }

        const response = await firstValueFrom(this.httpService.get(apiUrl));

        this.kafkaClient.emit('raw_data_topic', {
          sourceType: source.adapterType,
          payload: response.data,
        });

        await new Promise((r) => setTimeout(r, 2000));
      } catch (error) {
        this.logger.error(`Lỗi nguồn ${source.name}: ${error.message}`);
      }
    }
  }

  // LUỒNG 2: GIẢ LẬP BÃI ĐỖ XE - Chạy 1 phút/lần
  @Cron(CronExpression.EVERY_MINUTE)
  async handleParkingSimulation() {
    this.logger.debug(' [Simulation] Đang cập nhật trạng thái bãi đỗ xe...');

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
