# QuantumLeap Subscription Setup

## Tạo Subscription để lưu lịch sử dữ liệu

### 1. Subscription cho Weather Data

**POST** `http://localhost:9090/ngsi-ld/v1/subscriptions`

Headers:
```
Content-Type: application/ld+json
```

Body:
```json
{
  "id": "urn:ngsi-ld:Subscription:WeatherHistory",
  "type": "Subscription",
  "description": "Notify QuantumLeap for Weather data history",
  "entities": [
    {
      "type": "WeatherObserved"
    }
  ],
  "notification": {
    "endpoint": {
      "uri": "http://quantumleap:8668/v2/notify",
      "accept": "application/json"
    },
    "format": "normalized"
  },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld"
  ]
}
```

### 2. Subscription cho Air Quality Data

**POST** `http://localhost:9090/ngsi-ld/v1/subscriptions`

Body:
```json
{
  "id": "urn:ngsi-ld:Subscription:AirQualityHistory",
  "type": "Subscription",
  "description": "Notify QuantumLeap for AirQuality data history",
  "entities": [
    {
      "type": "AirQualityObserved"
    }
  ],
  "notification": {
    "endpoint": {
      "uri": "http://quantumleap:8668/v2/notify",
      "accept": "application/json"
    },
    "format": "normalized"
  },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld"
  ]
}
```
---

## Kiểm tra Subscriptions đã tạo

**GET** `http://localhost:9090/ngsi-ld/v1/subscriptions`

---

## Xóa Subscription (nếu cần)

**DELETE** `http://localhost:9090/ngsi-ld/v1/subscriptions/{subscriptionId}`

Ví dụ:
```
DELETE http://localhost:9090/ngsi-ld/v1/subscriptions/urn:ngsi-ld:Subscription:WeatherHistory
```

---

## Kiểm tra dữ liệu lịch sử trong QuantumLeap

### Sử dụng Backend History API (Khuyên dùng - có trong Swagger UI)

**Lấy biểu đồ nhiệt độ:**
```
GET http://localhost:8080/history/chart/temperature/1566083?hours=24
```

**Lấy biểu đồ lượng mưa:**
```
GET http://localhost:8080/history/chart/precipitation/1566083?hours=24
```

**Lấy biểu đồ AQI:**
```
GET http://localhost:8080/history/chart/aqi/Lat10.7721_Lon106.6983?hours=24
```

**Lấy lịch sử weather đầy đủ:**
```
GET http://localhost:8080/history/weather/1566083?lastN=10
```

**Lấy lịch sử air quality đầy đủ:**
```
GET http://localhost:8080/history/air/Lat10.7721_Lon106.6983?lastN=10
```

### Hoặc gọi trực tiếp QuantumLeap API

**Lấy lịch sử Weather:**
```
GET http://localhost:8668/v2/entities/urn:ngsi-ld:WeatherObserved:OpenWeatherMap:1566083/attrs/temperature?lastN=10
```

**Lấy lịch sử Air Quality:**
```
GET http://localhost:8668/v2/entities/urn:ngsi-ld:AirQualityObserved:OpenWeatherMap:AirQuality:Lat10.7721_Lon106.6983/attrs/pm25?lastN=10
```

**Lấy tất cả entities có lịch sử:**
```
GET http://localhost:8668/v2/entities
```

---

## Troubleshooting

### Nếu vẫn lỗi "relation does not exist" hoặc "column does not exist"

1. Kiểm tra logs QuantumLeap:
```bash
docker logs xsmart_quantumleap -f
```

2. Kiểm tra TimescaleDB có nhận được connection không:
```bash
docker exec -it xsmart_timescale psql -U ngb -d ngb
```

Trong psql:
```sql
\dt  -- Liệt kê tất cả bảng
SELECT * FROM pg_tables WHERE schemaname = 'public';
\d+ etweatherobserved  -- Xem cấu trúc bảng weather
\d+ etairqualityobserved  -- Xem cấu trúc bảng air quality
```

3. **Tạo bảng thủ công nếu cần** (QuantumLeap 1.0.0 với TimescaleDB):

```sql
-- Bảng Weather (nếu chưa có)
CREATE TABLE IF NOT EXISTS etweatherobserved (
    entity_id TEXT,
    entity_type TEXT,
    fiware_servicepath TEXT,
    time_index TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    temperature NUMERIC,
    relativehumidity NUMERIC,
    windspeed NUMERIC,
    winddirection NUMERIC,
    weathertype TEXT,
    address JSONB,
    dateobserved TIMESTAMP WITHOUT TIME ZONE,
    atmosphericpressure NUMERIC,
    visibility NUMERIC,
    cloudcoverage NUMERIC,
    precipitation NUMERIC,
    location TEXT,
    location_centroid TEXT,
    instanceid TEXT,
    __original_ngsi_entity__ JSONB,
    PRIMARY KEY (entity_id, time_index)
);

-- Bảng Air Quality (nếu chưa có)
CREATE TABLE IF NOT EXISTS etairqualityobserved (
    entity_id TEXT,
    entity_type TEXT,
    fiware_servicepath TEXT,
    time_index TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    airqualityindex NUMERIC,
    pm25 NUMERIC,
    pm10 NUMERIC,
    co NUMERIC,
    no2 NUMERIC,
    o3 NUMERIC,
    so2 NUMERIC,
    location TEXT,
    location_centroid TEXT,
    dateobserved TIMESTAMP WITHOUT TIME ZONE,
    instanceid TEXT,
    __original_ngsi_entity__ JSONB,
    PRIMARY KEY (entity_id, time_index)
);

-- Tạo hypertable cho TimescaleDB
SELECT create_hypertable('etweatherobserved', 'time_index', if_not_exists => TRUE);
SELECT create_hypertable('etairqualityobserved', 'time_index', if_not_exists => TRUE);
```

4. **Quan trọng**: Đảm bảo Scorpio gửi notification format `normalized` (không phải `keyValues`)

5. Nếu vẫn lỗi, thử xóa container QuantumLeap và TimescaleDB, tạo lại:
```bash
docker compose down quantumleap timescale
docker volume rm xsmart_timescale_data
docker compose up -d timescale quantumleap
```

---

## Lưu ý quan trọng

- **Endpoint phải là `http://quantumleap:8668/v2/notify`** (không phải v1)
- **Format phải là `normalized`** (QuantumLeap không hỗ trợ `keyValues`)
- **Context phải có** để Scorpio biết cách serialize
- Subscription chỉ trigger khi có **entity mới được tạo/cập nhật** sau khi subscription được tạo
- **QuantumLeap 1.0.0 v?i TimescaleDB**: Tên cột phải lowercase và match với NGSI-LD attribute names
- **C?u h�nh quan tr?ng trong docker-compose.yml**:
  - `QL_DEFAULT_DB: timescale`
  - `POSTGRES_HOST: timescale`
  - `POSTGRES_PORT: 5432`
  - `KEEP_RAW_ENTITY: "true"` (lưu entity gốc vào `__original_ngsi_entity__`)

---

## Frontend Integration

Sau khi subscriptions hoạt động, frontend có thể gọi các **Backend History APIs** (có trong Swagger UI t?i `http://localhost:8080/api/docs#History`):

**1. Chart APIs** - Trả về format sẵn cho Chart.js/Recharts:
- `/history/chart/temperature/:location` - Biểu đổ nhiệt độ
- `/history/chart/precipitation/:location` - Biểu đồ lượng mưa (Bar Chart)
- `/history/chart/aqi/:location` - Biểu đổ chất lượng không khí

**2. Raw Data APIs** - Trả về dữ liệu thô từ QuantumLeap:
- `/history/weather/:location` - Lịch sử weather đầy đủ
- `/history/air/:location` - Lịch sử air quality đầy đủ
- `/history/entities/:entityId/attrs/:attrName` - Lịch sử 1 attribute cụ thể
