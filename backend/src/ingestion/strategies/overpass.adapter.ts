import { Injectable } from '@nestjs/common';
import { BaseAdapter } from './base.adapter';
import { NgsiEntity } from '../../common/interfaces/ngsi-ld.interface';

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;

    highway?: string;
    public_transport?: string;

    parking?: string;
    capacity?: string;
    fee?: string;

    addr_street?: string;
    addr_city?: string;
    opening_hours?: string;
    website?: string;
  };
}

@Injectable()
export class OverpassAdapter extends BaseAdapter {
  sourceType = 'overpass_generic';
  targetModel = 'PointOfInterest';
  contextUrl = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';

  // Overpass trả về một cục lớn chứa nhiều địa điểm
  convert(data: any): NgsiEntity {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const element: OverpassElement = data;
    const tags = element.tags || {};

    // Xử lý tọa độ (Ưu tiên lat/lon, nếu không có thì lấy tâm center)
    const lat = element.lat || element.center?.lat || 0;
    const lon = element.lon || element.center?.lon || 0;

    // Phân loại Mô hình
    let type = 'PointOfInterest';
    let category = ['landmark'];
    let defaultName = 'Unknown Place';

    // --- Logic cho BÃI ĐỖ XE ---
    if (tags.amenity === 'parking') {
      type = 'OffStreetParking';
      category = ['parking'];
      defaultName = 'Public Parking';
    }
    // --- Logic cho BẾN XE BUS ---
    else if (tags.highway === 'bus_stop' || tags.public_transport === 'platform') {
      category = ['bus_stop'];
      defaultName = 'Bus Station';
    }
    // --- Logic cho ĐỊA ĐIỂM KHÁC ---
    else if (tags.amenity) {
      category = [tags.amenity];
      defaultName = tags.amenity;
    }

    const id = this.generateId(`OSM:${element.id}`);

    const attributes: Record<string, any> = {
      name: this.createProperty(tags.name || defaultName),
      category: this.createProperty(category),
      address: this.createProperty({
        streetAddress: tags.addr_street || 'Unknown Street',
        addressLocality: tags.addr_city || 'Ho Chi Minh City',
        addressCountry: 'VN',
      }),

      location: this.createGeoProperty(lat, lon),

      description: tags.opening_hours ? this.createProperty(`Open: ${tags.opening_hours}`) : undefined,
      source: this.createProperty('OpenStreetMap'),
    };

    //Xử lý riêng cho BÃI ĐỖ XE (Giả lập Realtime)
    if (type === 'OffStreetParking') {
      let total = tags.capacity ? parseInt(tags.capacity, 10) : 0;
      if (isNaN(total) || total === 0) total = (element.id % 80) + 20;

      const occupancyRate = Math.random() * 0.9;
      const occupied = Math.floor(total * occupancyRate);
      const available = total - occupied;

      attributes.totalSpotNumber = this.createProperty(total);
      attributes.availableSpotNumber = this.createProperty(available);

      if (!tags.fee) attributes.priceRate = this.createProperty('5.000 VND/h');

      return {
        ...this.buildEntity(id, attributes),
        type: 'OffStreetParking',
      };
    }

    Object.keys(attributes).forEach((key) => attributes[key] === undefined && delete attributes[key]);

    return this.buildEntity(id, attributes);
  }
}
