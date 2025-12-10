/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FloodService {
  private readonly logger = new Logger(FloodService.name);
  
  private readonly PYTHON_URL = 'http://flood-engine:8000'; 

  async getFloodLayerUrl(): Promise<string> {
    try {
      const { data } = await axios.get(`${this.PYTHON_URL}/flood-layer`);
      if (data.error) throw new Error(data.error);
      return data.url;
    } catch (e) {
      this.logger.error('Flood Layer Error:', e.message);
      throw e;
    }
  }

  async getSatelliteLayerUrl(): Promise<string> {
    try {
      const { data } = await axios.get(`${this.PYTHON_URL}/satellite-layer`);
      if (data.error) throw new Error(data.error);
      return data.url;
    } catch (e) {
      this.logger.error('Satellite Layer Error:', e.message);
      throw e;
    }
  }

  async checkFloodAtCoordinate(lat: number, lon: number) {
    try {
      const { data } = await axios.get(`${this.PYTHON_URL}/check-point`, { params: { lat, lon } });
      return data;
    } catch (e) {
      return { status: 'Lỗi', description: 'Không kết nối được vệ tinh', depth: 0 };
    }
  }
}