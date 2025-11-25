import { Injectable } from '@nestjs/common';
import { BaseAdapter } from './base.adapter';
import { NgsiEntity } from '../../common/interfaces/ngsi-ld.interface';

// Interface giúp gợi ý code (Intellisense)
interface OpenWeatherRaw {
  clouds?: { all: number };
  rain?: { '1h'?: number };
  main?: { temp: number; humidity: number; pressure?: number };
  wind?: { speed: number; deg: number };
  sys?: { country: string };
  coord?: { lat: number; lon: number };
  weather?: { description: string }[];
  dt?: number;
  id?: number;
  name?: string;
  visibility?: number;
}

@Injectable()
export class OpenWeatherMapAdapter extends BaseAdapter {
  sourceType = 'openweathermap';
  targetModel = 'WeatherObserved';
  contextUrl = 'https://smartdatamodels.org/context.jsonld';

  convert(data: any): NgsiEntity {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawData: OpenWeatherRaw = data;

    // 2. GIÁ TRỊ MẶC ĐỊNH AN TOÀN (Safe Fallbacks)
    const main = rawData.main || { temp: 0, humidity: 0 };
    const wind = rawData.wind || { speed: 0, deg: 0 };
    const sys = rawData.sys || { country: 'VN' };
    const coord = rawData.coord || { lat: 0, lon: 0 };
    const clouds = rawData.clouds || { all: 0 };
    const rain = rawData.rain || {};
    const rain1h = rain['1h'] || 0;

    // Xử lý mảng weather an toàn
    const weatherList = rawData.weather || [];
    const weatherDescription = weatherList.length > 0 ? weatherList[0].description : 'Clear';

    // 3. Xử lý thời gian
    const observationTime = rawData.dt ? new Date(rawData.dt * 1000).toISOString() : new Date().toISOString();

    // 4. Tạo ID
    const uniqueSuffix = rawData.id ? `OpenWeatherMap:${rawData.id}` : `OpenWeatherMap:${rawData.name || 'Unknown'}`;

    const id = this.generateId(uniqueSuffix);

    // 5. Mapping dữ liệu
    const attributes = {
      temperature: this.createProperty(main.temp, 'CEL', observationTime),

      relativeHumidity: this.createProperty(main.humidity, 'P1', observationTime),

      windSpeed: this.createProperty(wind.speed, 'MTS', observationTime),

      windDirection: this.createProperty(wind.deg, 'DD', observationTime),

      weatherType: this.createProperty(weatherDescription, undefined, observationTime),

      location: this.createGeoProperty(coord.lat, coord.lon),

      address: this.createProperty({
        addressLocality: rawData.name || 'Unknown',
        addressCountry: sys.country,
      }),

      dateObserved: this.createProperty(observationTime),

      atmosphericPressure: main.pressure ? this.createProperty(main.pressure, 'A97', observationTime) : undefined,

      visibility: rawData.visibility ? this.createProperty(rawData.visibility, 'MTR', observationTime) : undefined,

      cloudCoverage: this.createProperty(clouds.all / 100, 'P1', observationTime),

      precipitation: rain1h > 0 ? this.createProperty(rain1h, 'MMT', observationTime) : undefined,
    };

    return this.buildEntity(id, attributes);
  }
}
