/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
export interface NgsiProperty {
  type: 'Property';
  value: any;
  unitCode?: string;
  observedAt?: string;
  [key: string]: any;
}

//Cấu trúc của Vị trí địa lý (GeoProperty)
export interface NgsiGeoProperty {
  type: 'GeoProperty';
  value: {
    type: 'Point';
    coordinates: [number, number];
  };
}

//Cấu trúc của Mối quan hệ (Relationship)

export interface NgsiRelationship {
  type: 'Relationship';
  object: string;
}

//Cấu trúc tổng thể của một Entity hoàn chỉnh
export interface NgsiEntity {
  id: string;
  type: string;
  '@context'?: string | string[];
  location?: NgsiGeoProperty;

  // Các thuộc tính động (temperature, humidity...)
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  [key: string]: NgsiProperty | NgsiGeoProperty | NgsiRelationship | any;
}
