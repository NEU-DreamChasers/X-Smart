// src/ingestion/factory/adapter.factory.ts
import { Injectable } from '@nestjs/common';
import { BaseAdapter } from '../strategies/base.adapter';
import { OpenWeatherMapAdapter } from '../strategies/openweathermap.adapter';
import { AirQualityAdapter } from '../strategies/air-quality.adapter';
import { OverpassAdapter } from '../strategies/overpass.adapter';

@Injectable()
export class AdapterFactory {
  constructor(
    // Inject các Adapter con vào đây
    private readonly openWeatherMapAdapter: OpenWeatherMapAdapter,
    private readonly airQualityAdapter: AirQualityAdapter,
    private readonly overPassAdapter: OverpassAdapter,
  ) {}

  getAdapter(type: string): BaseAdapter {
    switch (type) {
      case 'openweathermap':
        return this.openWeatherMapAdapter;

      case 'openweathermap_aqi':
        return this.airQualityAdapter;

      case 'overpass_generic':
      case 'overpass_poi':
      case 'overpass_bus':
      case 'overpass_parking':
        return this.overPassAdapter;

      default:
        throw new Error(`No adapter found for type: ${type}`);
    }
  }
}
