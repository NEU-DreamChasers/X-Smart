/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SourcesService } from '../sources/sources.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly openWeatherApiKey: string;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly httpService: HttpService,
    private readonly sourcesService: SourcesService,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('OPENWEATHER_API_KEY');

    if (!key || key.trim() === '') {
      throw new Error('❌ LỖI CẤU HÌNH: Chưa tìm thấy OPENWEATHER_API_KEY!');
    }
    this.openWeatherApiKey = key || '';
  }

  @Cron(CronExpression.EVERY_5_MINUTES) // Chạy 5 phút/lần
  async handleCron() {
    this.logger.debug('--- [Producer] Bắt đầu quét Database tìm nguồn dữ liệu ---');

    const sources = await this.sourcesService.findAll();

    if (sources.length === 0) {
      this.logger.warn('Database chưa có nguồn nào. Hãy chạy Seeding hoặc thêm thủ công.');
      return;
    }

    for (const source of sources) {
      try {
        let apiUrl = '';
        let isOverpass = false;

        // --- TẠO URL ĐỘNG ---
        if (source.adapterType === 'openweathermap') {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}&units=metric`;
        } else if (source.adapterType === 'openweathermap_aqi') {
          apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${source.latitude}&lon=${source.longitude}&appid=${this.openWeatherApiKey}`;
        } else if (source.adapterType === 'overpass_poi') {
          //Lấy tiện ích chung (bệnh viện, trường học, ...)
          const query = `[out:json];node(around:1000,${source.latitude},${source.longitude})["amenity"];out;`;
          apiUrl = `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`;
          isOverpass = true;
        } else if (source.adapterType === 'overpass_bus') {
          // Lấy Bến xe Bus (tag highway=bus_stop)
          const query = `[out:json];node(around:1000,${source.latitude},${source.longitude})["highway"="bus_stop"];out;`;
          apiUrl = `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`;
          isOverpass = true;
        } else if (source.adapterType === 'overpass_parking') {
          // Lấy Bãi đỗ xe (tag amenity=parking)
          // Lấy cả Node (điểm) và Way (vùng), dùng out center để lấy tâm
          const query = `[out:json];(node(around:1000,${source.latitude},${source.longitude})["amenity"="parking"];way(around:1000,${source.latitude},${source.longitude})["amenity"="parking"];);out center;`;
          apiUrl = `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`;
          isOverpass = true;
        }

        if (!apiUrl) {
          this.logger.warn(`Chưa hỗ trợ loại adapter: ${source.adapterType}`);
          continue;
        }

        // --- GỌI API ---
        const response = await firstValueFrom(this.httpService.get(apiUrl));
        const responseData = response.data;

        // --- XỬ LÝ DỮ LIỆU & BẮN KAFKA ---
        if (isOverpass) {
          // Xử lý Overpass (Mảng elements)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const elements: any[] = responseData.elements || [];

          // Giới hạn số lượng (Bus lấy 20, Parking lấy 10)
          const limit = source.adapterType === 'overpass_bus' ? 20 : 10;
          const limitedElements = elements.slice(0, limit);

          for (const element of limitedElements) {
            this.kafkaClient.emit('raw_data_topic', {
              sourceType: source.adapterType,
              payload: element,
            });
          }
          this.logger.log(`[Producer] Đã gửi ${limitedElements.length} địa điểm từ ${source.name}`);
        } else {
          this.kafkaClient.emit('raw_data_topic', {
            sourceType: source.adapterType,
            payload: responseData,
          });

          this.logger.log(`[Producer] Đã gửi: ${source.name} (${source.adapterType})`);
          await sleep(3000);
        }
      } catch (error) {
        const err = error;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.error(`[Producer] Lỗi nguồn ${source.name}: ${err.message}`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const statusCode = err.response?.status;
        if (statusCode === 429) {
          this.logger.warn('⚠️ Bị chặn Rate Limit (429). Đang tạm dừng 20s để hồi phục...');
          await sleep(20000);
        } else {
          await sleep(5000);
        }
      }
    }
  }
}
