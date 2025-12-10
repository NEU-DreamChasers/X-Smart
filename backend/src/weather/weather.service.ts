/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  
  async getForecast(entityId: string) {
    try {
      // Trích xuất ID từ chuỗi URN
      const parts = entityId.split(':');
      const cityId = parts[parts.length - 1];

      if (!cityId || isNaN(Number(cityId))) {
        throw new Error('Invalid City ID in Entity URN');
      }

      // Gọi OpenWeatherMap API (Forecast Endpoint)
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&units=metric&lang=vi&appid=${apiKey}`;

      const response = await axios.get(url);
      return response.data;

    } catch (error) {
      console.error("Lỗi lấy dự báo:", error);
      throw new HttpException('Không thể lấy dữ liệu dự báo', HttpStatus.BAD_GATEWAY);
    }
  }
}