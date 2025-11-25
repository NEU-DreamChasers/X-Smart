import { Injectable } from '@nestjs/common';
import { BaseAdapter } from './base.adapter';
import { NgsiEntity } from '../../common/interfaces/ngsi-ld.interface';

// Interface cho dữ liệu Air Pollution của OpenWeatherMap
interface AirQualityRaw {
  list?: Array<{
    main?: { aqi: number };
    components?: {
      co?: number;
      no?: number;
      no2?: number;
      o3?: number;
      so2?: number;
      pm2_5?: number;
      pm10?: number;
      nh3?: number;
    };
    dt?: number;
  }>;
  coord?: { lat: number; lon: number };
}

@Injectable()
export class AirQualityAdapter extends BaseAdapter {
  sourceType = 'openweathermap_aqi';
  targetModel = 'AirQualityObserved';
  contextUrl = 'https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld';

  convert(data: any): NgsiEntity {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawData: AirQualityRaw = data;

    const list = rawData.list && rawData.list.length > 0 ? rawData.list[0] : {};
    const components = list.components || {};
    const main = list.main || { aqi: 0 };
    const coord = rawData.coord || { lat: 0, lon: 0 };

    const observationTime = list.dt ? new Date(list.dt * 1000).toISOString() : new Date().toISOString();

    const id = this.generateId(`AirQuality:Lat${coord.lat}_Lon${coord.lon}`);

    const attributes = {
      location: this.createGeoProperty(coord.lat, coord.lon),
      dateObserved: this.createProperty(observationTime),

      // --- CÁC CHỈ SỐ Ô NHIỄM ---
      // GP = Micrograms per cubic meter (µg/m³) - Đơn vị chuẩn Smart City

      airQualityIndex: this.createProperty(main.aqi), // 1 = Tốt, 5 = Kém

      pm25: this.createProperty(components.pm2_5, 'GP', observationTime),
      pm10: this.createProperty(components.pm10, 'GP', observationTime),

      co: this.createProperty(components.co, 'GP', observationTime),
      no2: this.createProperty(components.no2, 'GP', observationTime),
      o3: this.createProperty(components.o3, 'GP', observationTime),
      so2: this.createProperty(components.so2, 'GP', observationTime),
    };

    // Xóa các trường undefined (ví dụ nếu API không trả về nh3)
    Object.keys(attributes).forEach((key) => attributes[key] === undefined && delete attributes[key]);

    return this.buildEntity(id, attributes);
  }
}
