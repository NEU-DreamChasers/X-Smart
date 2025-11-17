# Kiến trúc hệ thống (ARCHITECTURE)

X-Smart là nền tảng dữ liệu mở cho đô thị thông minh, xây dựng trên các tiêu chuẩn mở: **NGSI-LD** (ETSI), **SOSA/SSN** (W3C) và **FiWARE Smart Data Models**.

## Tổng quan kiến trúc

- **Frontend (Next.js)**: giao diện dashboard, bản đồ và trực quan hoá dữ liệu.
- **Backend (NestJS)**: lớp API REST, wrapper cho NGSI‑LD, xử lý batch và adapter.
- **Scorpio Context Broker**: quản lý entity theo chuẩn NGSI‑LD (cổng 9090).
- **PostgreSQL + PostGIS**: lưu trữ dữ liệu không gian và thực thể.
- **Kafka (KRaft)**: streaming sự kiện cho thông báo/subscription.

Luồng cơ bản:

1. Data adapters thu nguồn dữ liệu (OpenWeatherMap, OpenAQ, OSM, GTFS, v.v.)
2. Backend chuẩn hoá và gọi Scorpio (NGSI‑LD) để tạo/ cập nhật entity
3. Frontend truy vấn backend để hiển thị dữ liệu và biểu đồ

## Thành phần chính

### Frontend

- Dashboard tương tác, tìm kiếm, lọc, bản đồ (Leaflet/Mapbox).

### Backend (NestJS)

- `NgsiLdService`: tương tác trực tiếp với Scorpio.
- `NgsiLdController`: expose các endpoint REST như `/api/entities`.
- `NgsiLdModule`: module cấu hình DI.

Các endpoint chính:

```
GET    /api/entities
GET    /api/entities/:id
POST   /api/entities
PATCH  /api/entities/:id
DELETE /api/entities/:id
POST   /api/entities/batch
GET    /api/entities/health/info
```

### Scorpio Context Broker

- Cung cấp API NGSI‑LD đầy đủ: quản lý entity, subscription, truy vấn thời gian.
- Chạy trên `http://scorpio:9090` trong cấu hình Docker Compose.

Một số API quan trọng của Scorpio:

```
POST   /ngsi-ld/v1/entities
GET    /ngsi-ld/v1/entities
GET    /ngsi-ld/v1/entities/:id
PATCH  /ngsi-ld/v1/entities/:id/attrs
DELETE /ngsi-ld/v1/entities/:id
POST   /ngsi-ld/v1/subscriptions
POST   /ngsi-ld/v1/entityOperations/upsert
```

### Cơ sở dữ liệu & Message Bus

- **PostgreSQL + PostGIS**: lưu thực thể và dữ liệu địa lý.
- **Kafka (KRaft)**: dùng cho eventos/subscriptions (Scorpio có thể dùng Kafka để publish sự kiện).

## Mô hình dữ liệu (tóm tắt)

- **SOSA/SSN**: mô tả Sensor, Observation, ObservableProperty, FeatureOfInterest.
- **FiWARE Smart Data Models**: các kiểu cụ thể như `WeatherObserved`, `AirQualityObserved`, `PointOfInterest`, `TrafficFlowObserved`.

Ví dụ entity NGSI‑LD (tóm tắt):

```json
{
  "id": "urn:ngsi-ld:WeatherObserved:HanoiCenter:...",
  "type": "WeatherObserved",
  "temperature": { "type": "Property", "value": 25.5 },
  "location": {
    "type": "GeoProperty",
    "value": { "type": "Point", "coordinates": [105.83, 21.03] }
  },
  "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
}
```

## Các cải tiến trong tương lai

- Thêm connector thực tế: OpenWeatherMap, OpenAQ, OSM, GTFS
- Truy vấn nâng cao: temporal, geospatial, aggregations
- Subscriptions & notifications: webhook, MQTT
- Tích hợp semantic: context registry, ontology mở rộng

---

Tài liệu tham khảo:

- ETSI NGSI‑LD spec, Scorpio docs, FiWARE Smart Data Models, W3C SOSA/SSN, JSON-LD
