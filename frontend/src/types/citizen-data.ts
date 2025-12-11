/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
export interface NgsiProperty<T> {
  type: 'Property';
  value: T;
  unitCode?: string;
  observedAt?: string;
}

export interface NgsiGeoProperty {
  type: 'GeoProperty';
  value: {
    type: 'Point';
    coordinates: [number, number]; 
  };
}

// Cấu trúc tổng quát cho một Entity (Cảm biến/Địa điểm)
export interface CitizenEntity {
  id: string;
  type: string;
  location?: NgsiGeoProperty;
  
  // Các thuộc tính chung
  name?: NgsiProperty<string>;
  address?: NgsiProperty<any>;
  
  // Thuộc tính Thời tiết (WeatherObserved) [cite: 456]
  temperature?: NgsiProperty<number>;
  relativeHumidity?: NgsiProperty<number>;
  weatherType?: NgsiProperty<string>;
  
  // Thuộc tính Không khí (AirQualityObserved) [cite: 427]
  airQualityIndex?: NgsiProperty<number>;
  pm25?: NgsiProperty<number>;
  co?: NgsiProperty<number>;

  // Thuộc tính Bãi đỗ xe (OffStreetParking) [cite: 366]
  availableSpotNumber?: NgsiProperty<number>;
  totalSpotNumber?: NgsiProperty<number>;
  occupancy?: NgsiProperty<number>;

  [key: string]: any;
}