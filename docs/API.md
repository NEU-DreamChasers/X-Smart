# API

Tài liệu API NGSI-LD của X-Smart (tiếng Việt)

Base URL (ví dụ cục bộ):

```
http://localhost:8080/api
```

Header mặc định:

```
Content-Type: application/ld+json
Accept: application/ld+json
```

## Các endpoint chính

1. Truy vấn entities

GET `/entities`

Tham số query (tuỳ chọn): `type`, `q`, `limit`, `offset`, `georel`, `geometry`, `coordinates`.

Ví dụ:

```bash
curl -X GET "http://localhost:8080/api/entities?type=WeatherObserved&limit=10"
```

Trả về: mảng JSON-LD của entities.

2. Lấy entity theo ID

GET `/entities/:id`

Tuỳ chọn: `attrs` để chỉ trả về một số thuộc tính.

Ví dụ:

```bash
curl -X GET "http://localhost:8080/api/entities/urn:ngsi-ld:WeatherObserved:Hanoi:..."
```

3. Tạo entity

POST `/entities`

Request body: JSON-LD mô tả entity (type, attributes, @context nếu cần).

Ví dụ:

```bash
curl -X POST "http://localhost:8080/api/entities" -H "Content-Type: application/ld+json" -d '{"type":"WeatherObserved","temperature":{"type":"Property","value":26}}'
```

Trả về (thường): `{ "success": true, "id": "urn:ngsi-ld:..." }`

4. Cập nhật thuộc tính entity

PATCH `/entities/:id`

Gửi JSON-LD chứa các thuộc tính cần cập nhật.

5. Xoá entity

DELETE `/entities/:id` (trả 204 No Content nếu thành công)

6. Batch upsert

POST `/entities/batch` với mảng JSON-LD để tạo/cập nhật nhiều entity trong một request.

7. Health check

GET `/entities/health/info` — trả thông tin broker/DB/status.

## Lỗi phổ biến

- 400 Bad Request: tham số truy vấn không hợp lệ.
- 404 Not Found: entity không tồn tại.

---

Với các ví dụ chi tiết và response mẫu, tham khảo phiên bản tiếng Anh nếu cần giữ nguyên định dạng JSON mẫu.

```json
{
  "error": "Entity not found",
  "id": "urn:ngsi-ld:..."
}
```

### 409 Conflict

```json
{
  "error": "Entity already exists",
  "id": "urn:ngsi-ld:..."
}
```

### 503 Service Unavailable

```json
{
  "error": "Scorpio broker is not available"
}
```

---

## Common Query Patterns

### Weather by Temperature Range

```bash
# Temperature between 20°C and 30°C
curl -X GET "http://localhost:8080/api/entities?type=WeatherObserved&q=temperature%3E20%3Btemperature%3C30"
```

### Air Quality by AQI Level

```bash
# AQI >= 100 (unhealthy)
curl -X GET "http://localhost:8080/api/entities?type=AirQualityObserved&q=AQI%3E%3D100"
```

### Points of Interest by Category

```bash
# All hospitals and medical facilities
curl -X GET "http://localhost:8080/api/entities?type=PointOfInterest&q=category%3Dhospital"
```

### Spatial Query (Near Downtown Hanoi)

```bash
curl -X GET "http://localhost:8080/api/entities?type=PointOfInterest&georel=near;maxDistance:2000&geometry=Point&coordinates=105.8547,21.0294"
```

### Pagination (10 items per page)

```bash
# First page
curl -X GET "http://localhost:8080/api/entities?type=WeatherObserved&limit=10&offset=0"

# Second page
curl -X GET "http://localhost:8080/api/entities?type=WeatherObserved&limit=10&offset=10"
```

---

## Demo Data Endpoint (Optional)

To load sample data for testing (future endpoint):

```bash
POST /admin/data/load-demo
```

---

## Rate Limiting

Currently no rate limiting is enforced. This may be added in production deployments.

---

## CORS

CORS is enabled for cross-origin requests (configured in NestJS).

---

## References

- [NGSI-LD API Specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.02.02_60/gs_CIM009v010202p.pdf)
- [Scorpio API Documentation](https://scorpio.readthedocs.io/en/latest/API_walkthrough.html)
- [JSON-LD Specification](https://json-ld.org/)
