/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NgsiEntity } from '../common/interfaces/ngsi-ld.interface';

@Injectable()
export class ScorpioService {
  private readonly logger = new Logger(ScorpioService.name);
  private readonly scorpioUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.scorpioUrl = this.configService.get<string>('SCORPIO_URL', 'http://localhost:9090');
  }
  //1. POST/PUT Entity
  async publishEntity(entity: NgsiEntity): Promise<void> {
    try {
      const url = `${this.scorpioUrl}/ngsi-ld/v1/entityOperations/upsert`;
      const payload = [entity];

      const headers = {
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers,
          params: { options: 'update' },
        }),
      );

      const responseBody = response.data;
      if (Array.isArray(responseBody) && responseBody.length > 0 && responseBody[0].errors) {
        this.logger.error(`[SCORPIO REJECTED] Lý do: ${JSON.stringify(responseBody[0].errors)}`);
      } else {
        this.logger.log(`[SCORPIO SUCCESS] Entity ID: ${entity.id}`);
      }
    } catch (error) {
      this.handleAxiosError(error, `Publish ${entity.id}`);
    }
  }

  // --- 2. GET: Lấy chi tiết Entity theo Type hoặc Query ---
  async getEntitiesByType(type: string, query?: string): Promise<any> {
    try {
      // Xây dựng URL: /ngsi-ld/v1/entities?type=...
      let url = `${this.scorpioUrl}/ngsi-ld/v1/entities?type=${encodeURIComponent(type)}`;

      // Nếu có thêm query phụ (ví dụ lọc bus_stop)
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      // Thêm limit để tránh lấy quá nhiều (vd: 100)
      url += '&limit=100';

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Accept: 'application/ld+json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(error, `Get List Type: ${type}`);
      throw error;
    }
  }

  //GET: Lấy chi tiết Entity theo ID
  async getEntity(urn: string): Promise<any> {
    try {
      const url = `${this.scorpioUrl}/ngsi-ld/v1/entities/${urn}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Accept: 'application/ld+json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException(`Không tìm thấy Entity với ID: ${urn}`);
      }
      this.handleAxiosError(error, `Get ${urn}`);
      throw error;
    }
  }

  // --- 3. DELETE: Xóa Entity theo ID ---
  async deleteEntity(urn: string): Promise<void> {
    try {
      const url = `${this.scorpioUrl}/ngsi-ld/v1/entities/${urn}`;

      await firstValueFrom(this.httpService.delete(url));

      this.logger.log(`[SCORPIO DELETED] ID: ${urn}`);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException(`Không tìm thấy Entity để xóa: ${urn}`);
      }
      this.handleAxiosError(error, `Delete ${urn}`);
      throw error;
    }
  }

  // ==========================================
  // CÁC HÀM TIỆN ÍCH (HELPER) XỬ LÝ LỖI
  // ==========================================

  private isNotFoundError(error: any): boolean {
    return error.response?.status === 404;
  }

  private handleAxiosError(error: any, context: string) {
    this.logger.error(`[SCORPIO ERROR] ${context} thất bại.`);

    if (error.response) {
      this.logger.error(`Server Responded: ${JSON.stringify(error.response.data)}`);
    } else {
      this.logger.error(error.message || 'Unknown Network Error');
    }
  }
}
