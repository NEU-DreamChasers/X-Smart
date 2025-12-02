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

  // POST/PUT Entity
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

  // --- GET: Lấy chi tiết Entity theo Type hoặc Query ---
  async getEntitiesByType(type: string, query?: string, limit?: number, offset?: number): Promise<{ data: any[], count: number }> {
    try {
      // CHẾ ĐỘ PHÂN TRANG
      if (limit && limit > 0) {

        let url = `${this.scorpioUrl}/ngsi-ld/v1/entities?type=${encodeURIComponent(type)}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        
        url += `&limit=${limit}&offset=${offset || 0}`;
        url += `&count=true`;

        const response = await firstValueFrom(
          this.httpService.get(url, { headers: { Accept: 'application/json' } })
        );
        
        const countHeader = response.headers['ngsild-results-count'];
        const totalCount = parseInt(countHeader || '0', 10);

        return {
            data: response.data as any[],
            count: totalCount
        };
      }

      // CHẾ ĐỘ TẢI TOÀN BỘ DỮ LIỆU
      const BATCH_SIZE = 1000;
      let currentOffset = 0;
      let allEntities: Record<string, any>[] = [];
      let keepFetching = true;

      while (keepFetching) {
        let url = `${this.scorpioUrl}/ngsi-ld/v1/entities?type=${encodeURIComponent(type)}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        url += `&limit=${BATCH_SIZE}&offset=${currentOffset}`;

        const response = await firstValueFrom(
          this.httpService.get(url, {
            headers: { Accept: 'application/ld+json' },
          }),
        );

        const data: Record<string, any>[] = response.data;

        if (data.length > 0) {
          allEntities = allEntities.concat(data);
          currentOffset += BATCH_SIZE;

          if (data.length < BATCH_SIZE) {
            keepFetching = false;
          }
        } else {
            keepFetching = false;
        }
      } 

      return {
          data: allEntities,
          count: allEntities.length
      };

    } catch (error) {
      this.handleAxiosError(error, `Get List Type: ${type}`);
      throw error;
    }
  }

  // ... (Các hàm getEntity, deleteEntity, helper giữ nguyên như cũ) ...
  
  // GET: Lấy chi tiết Entity theo ID
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

  // --- DELETE: Xóa Entity theo ID ---
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

  // CÁC HÀM TIỆN ÍCH XỬ LÝ LỖI

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