// src/common/interfaces/ngsi-ld.interface.ts

/**
 * Cấu trúc của một Thuộc tính (Property) trong NGSI-LD
 * Ví dụ: Nhiệt độ, Độ ẩm, Tốc độ xe...
 */
export interface NgsiProperty {
  type: 'Property';
  value: any; // Giá trị thực (số, chuỗi, object...)
  unitCode?: string; // Mã đơn vị đo lường (VD: CEL, MTR) - Rất quan trọng cho OLP
  observedAt?: string; // Thời gian quan trắc (ISO 8601 UTC)
  [key: string]: any; // Cho phép thêm metadata phụ khác
}

/**
 * Cấu trúc của Vị trí địa lý (GeoProperty)
 * Bắt buộc tuân thủ chuẩn GeoJSON
 */
export interface NgsiGeoProperty {
  type: 'GeoProperty';
  value: {
    type: 'Point'; // Hiện tại OLP thường dùng Point (Điểm)
    coordinates: [number, number]; // Quan trọng: [Kinh độ (Lon), Vĩ độ (Lat)] - Đừng ngược!
  };
}

/**
 * Cấu trúc của Mối quan hệ (Relationship)
 * Dùng để liên kết Entity này với Entity khác (VD: Cảm biến A thuộc Tòa nhà B)
 */
export interface NgsiRelationship {
  type: 'Relationship';
  object: string; // URN của đối tượng được liên kết (VD: urn:ngsi-ld:Building:001)
}

/**
 * Cấu trúc tổng thể của một Entity hoàn chỉnh
 */
export interface NgsiEntity {
  id: string; // Định danh duy nhất (URN)
  type: string; // Loại Entity (VD: WeatherObserved)
  '@context'?: string | string[]; // Link tới Smart Data Models
  location?: NgsiGeoProperty; // Hầu hết các thiết bị IoT đều cần vị trí

  // Các thuộc tính động (temperature, humidity...)
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  [key: string]: NgsiProperty | NgsiGeoProperty | NgsiRelationship | any;
}
