import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NgsiEntity, NgsiGeoProperty, NgsiProperty, NgsiRelationship } from '../../common/interfaces/ngsi-ld.interface';

@Injectable()
export abstract class BaseAdapter {
  abstract sourceType: string;
  abstract targetModel: string;
  abstract contextUrl: string;

  // --- HÀM TRỪU TƯỢNG: LOGIC CHUYỂN ĐỔI CHÍNH ---
  abstract convert(rawData: any): NgsiEntity | Promise<NgsiEntity>;

  // CÁC HÀM TIỆN ÍCH (HELPER) - DÙNG ĐỂ TẠO DỮ LIỆU CHUẨN
  protected generateId(uniqueSuffix?: string): string {
    const suffix = uniqueSuffix ? uniqueSuffix.replace(/\s+/g, '') : uuidv4();

    return `urn:ngsi-ld:${this.targetModel}:${suffix}`;
  }

  /** Tạo một Property chuẩn NGSI-LD
   * @param value
   * @param unitCode
   * @param observedAt
   */
  protected createProperty(value: any, unitCode?: string, observedAt?: string): NgsiProperty {
    const prop: NgsiProperty = {
      type: 'Property',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: value,
    };

    if (unitCode) {
      prop.unitCode = unitCode;
    }

    if (observedAt) {
      prop.observedAt = observedAt;
    }

    return prop;
  }

  // Tạo GeoProperty từ tọa độ Lat/Lon
  protected createGeoProperty(lat: number, lon: number): NgsiGeoProperty {
    const validLat = typeof lat === 'number' ? lat : 0;
    const validLon = typeof lon === 'number' ? lon : 0;

    return {
      type: 'GeoProperty',
      value: {
        type: 'Point',
        coordinates: [validLon, validLat],
      },
    };
  }

  //Tạo Relationship (Liên kết tới Entity khác)
  protected createRelationship(objectUrn: string): NgsiRelationship {
    return {
      type: 'Relationship',
      object: objectUrn,
    };
  }

  //Đóng gói cuối cùng: Gắn ID, Type và Context vào
  protected buildEntity(id: string, attributes: Record<string, any>): NgsiEntity {
    return {
      id,
      type: this.targetModel,
      '@context': [this.contextUrl],
      ...attributes,
    };
  }
}
