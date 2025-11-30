/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly quantumLeapUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.quantumLeapUrl = this.configService.get<string>('QUANTUMLEAP_URL', 'http://quantumleap:8668');
  }

  async getEntitiesByType(type: string, limit: number) {
    try {
      const url = `${this.quantumLeapUrl}/v2/entities?type=${type}&limit=${limit}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get entities: ${error}`);
      throw error;
    }
  }

  async getAttributeHistory(
    entityId: string,
    attrName: string,
    options: { lastN?: number; fromDate?: string; toDate?: string },
  ) {
    try {
      let url = `${this.quantumLeapUrl}/v2/entities/${encodeURIComponent(entityId)}/attrs/${attrName}?`;

      if (options.lastN) url += `lastN=${options.lastN}&`;
      if (options.fromDate) url += `fromDate=${options.fromDate}&`;
      if (options.toDate) url += `toDate=${options.toDate}&`;

      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get attribute history: ${error}`);
      throw error;
    }
  }

  async getWeatherHistory(entityId: string, lastN: number) {
    try {
      const url = `${this.quantumLeapUrl}/v2/entities/${encodeURIComponent(entityId)}?lastN=${lastN}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get weather history: ${error}`);
      throw error;
    }
  }

  async getAirQualityHistory(entityId: string, lastN: number) {
    try {
      const url = `${this.quantumLeapUrl}/v2/entities/${encodeURIComponent(entityId)}?lastN=${lastN}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get air quality history: ${error}`);
      throw error;
    }
  }

  async getTemperatureChartData(location: string, hours: number) {
    const entityId = `urn:ngsi-ld:WeatherObserved:OpenWeatherMap:${location}`;
    const data = await this.getAttributeHistory(entityId, 'temperature', { lastN: hours });

    // Transform to Chart.js format
    const labels = data.index || [];
    const values = data.values || [];

    return {
      labels: labels.map((timestamp: string) =>
        new Date(timestamp).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
      ),
      datasets: [
        {
          label: 'Nhiệt độ (°C)',
          data: values,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    };
  }

  async getAQIChartData(location: string, hours: number) {
    const entityId = `urn:ngsi-ld:AirQualityObserved:OpenWeatherMap:AirQuality:${location}`;
    const pm25Data = await this.getAttributeHistory(entityId, 'pm25', { lastN: hours });

    const labels = pm25Data.index || [];
    const pm25Values = pm25Data.values || [];

    return {
      labels: labels.map((timestamp: string) =>
        new Date(timestamp).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
      ),
      datasets: [
        {
          label: 'PM2.5 (µg/m³)',
          data: pm25Values,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
      ],
    };
  }

  async getPrecipitationChartData(location: string, hours: number) {
    const entityId = `urn:ngsi-ld:WeatherObserved:OpenWeatherMap:${location}`;
    const data = await this.getAttributeHistory(entityId, 'precipitation', { lastN: hours });

    const labels = data.index || [];
    const values = data.values || [];

    return {
      labels: labels.map((timestamp: string) =>
        new Date(timestamp).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
      ),
      datasets: [
        {
          label: 'Lượng mưa (mm)',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    };
  }
}
