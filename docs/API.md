# 📖 API Documentation — X-Smart

> Hướng dẫn sử dụng REST API của X-Smart cho đô thị thông minh

---

## 📑 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Authentication](#-authentication)
- [Base URL & Headers](#-base-url--headers)
- [Entity Endpoints](#-entity-endpoints)
- [Sources API](#-sources-api)
- [Notifications API](#-notifications-api)
- [Reports API](#-reports-api)
- [History & Charts API](#-history--charts-api)
- [Map Search API](#-map-search-api)
- [Admin Endpoints](#-admin-endpoints)
- [Error Handling](#-error-handling)
- [Ví dụ thực tế](#-ví-dụ-thực-tế)

---

## 🔍 Giới thiệu

**X-Smart API** là REST API cho phép:
- ✅ Truy vấn dữ liệu entity (thời tiết, không khí, bãi đỗ, xe bus, v.v.)
- ✅ Thao tác CRUD (Create, Read, Update, Delete)
- ✅ Truy vấn lịch sử và biểu đồ dữ liệu
- ✅ Quản lý báo cáo từ công dân
- ✅ Tìm kiếm địa điểm gần vị trí hiện tại
- ✅ Quản lý nguồn dữ liệu & thông báo

**Base URL (development):**
```
http://localhost:8080/api
```

**Base URL (production):**
```
https://your-domain.com/api
```

---

## 🔐 Authentication

### JWT Token

Hầu hết các endpoint yêu cầu **JWT token** trong header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Đăng nhập (Email/Password)

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Đăng nhập Google OAuth2

**Bước 1: Chuyển hướng sang Google**
```
GET /auth/google
```

**Bước 2: Google callback**
```
GET /auth/google/callback?code=...
```

Sẽ redirect về frontend với token: `http://localhost:3000/auth/success?token=<jwt_token>`

---

## 📡 Base URL & Headers

### Headers mặc định

```http
Content-Type: application/json
Accept: application/ld+json
Authorization: Bearer <token>
```

### Ví dụ request

```bash
curl -X GET "http://localhost:8080/api/weather/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🌐 Entity Endpoints

Quản lý dữ liệu entity theo lĩnh vực (domain)

### Lấy danh sách entities

```
GET /:domain/status
```

**Domain hỗ trợ:** `weather`, `air`, `bus`, `parking`, `poi`

**Query Parameters:**
- `limit` (int) — Số lượng tối đa (bỏ trống = tất cả)
- `offset` (int) — Vị trí bắt đầu (default: 0)
- `category` (string) — Lọc theo danh mục (dành cho POI, ví dụ: hospital, school)

**Ví dụ:**
```bash
GET /weather/status?limit=20&offset=0
GET /bus/status?limit=10
GET /parking/status
GET /poi/status?category=hospital&limit=50
```

**Response Header:**
```
X-Total-Count: 100
```

**Response (200 OK):**
```json
[
  {
    "id": "urn:ngsi-ld:WeatherObserved:OpenWeatherMap:1566083",
    "type": "WeatherObserved",
    "name": { "value": "Hà Nội" },
    "temperature": { "value": 26.5 },
    "humidity": { "value": 65 },
    "location": {
      "type": "GeoProperty",
      "value": {
        "type": "Point",
        "coordinates": [105.8345, 21.0285]
      }
    }
  }
]
```

### Lấy chi tiết entity

```
GET /:domain/status/:id
```

**Parameters:**
- `domain` — Lĩnh vực (weather, air, bus, parking, poi)
- `id` — ID thiết bị (sẽ tự động chuyển sang URN)

**Ví dụ:**
```bash
GET /weather/status/device_01
GET /bus/status/01
GET /parking/status/P001
```

**Response (200 OK):**
```json
{
  "id": "urn:ngsi-ld:WeatherObserved:OpenWeatherMap:device_01",
  "type": "WeatherObserved",
  "name": { "value": "Trạm 1" },
  "temperature": { "value": 26.5 },
  "humidity": { "value": 65 }
}
```

### Tạo/Gửi dữ liệu từ thiết bị

```
POST /:domain/status/:id
```

**Yêu cầu:** JWT token + Admin role

**Query Parameters:**
- `type` (optional) — Kiểu adapter (mặc định: tự động)

**Request Body:**
```json
{
  "main": { "temp": 30, "humidity": 65 },
  "wind": { "speed": 5 },
  "name": "Sensor 1"
}
```

**Response (200 OK):**
```json
{
  "id": "urn:ngsi-ld:WeatherObserved:OpenWeatherMap:device_01",
  "type": "WeatherObserved",
  "temperature": { "value": 30 }
}
```

### Cập nhật dữ liệu entity

```
PUT /:domain/status/:id
```

**Yêu cầu:** JWT token + Admin role

**Request Body:**
```json
{
  "main": { "temp": 35, "humidity": 50 }
}
```

**Response (200 OK):** Dữ liệu entity cập nhật

### Xóa entity

```
DELETE /:domain/status/:id
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):**
```json
{
  "message": "Đã xóa thành công thiết bị: device_01",
  "urn": "urn:ngsi-ld:WeatherObserved:OpenWeatherMap:device_01"
}
```

**Response (404):** Entity không tồn tại

---

## 📚 Sources API

Quản lý nguồn dữ liệu (Data Sources)

### Lấy danh sách nguồn dữ liệu

```
GET /sources
```

**Query Parameters:**
- `limit` (int) — Số lượng tối đa
- `offset` (int) — Vị trí bắt đầu

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "OpenWeatherMap Station",
    "adapterType": "openweathermap",
    "latitude": 21.0285,
    "longitude": 105.8345,
    "isActive": true
  }
]
```

### Lấy chi tiết nguồn dữ liệu

```
GET /sources/:id
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "OpenWeatherMap Station",
  "adapterType": "openweathermap",
  "latitude": 21.0285,
  "longitude": 105.8345,
  "isActive": true
}
```

### Tạo nguồn dữ liệu mới

```
POST /sources
```

**Yêu cầu:** JWT token + Admin role

**Request Body:**
```json
{
  "name": "New Station",
  "adapterType": "openweathermap",
  "latitude": 21.0,
  "longitude": 105.8
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Station"
}
```

### Cập nhật nguồn dữ liệu

```
PATCH /sources/:id
```

**Yêu cầu:** JWT token + Admin role

**Request Body:**
```json
{
  "isActive": false,
  "name": "Station Renamed"
}
```

**Response (200 OK):** Thông tin nguồn được cập nhật

### Xóa nguồn dữ liệu

```
DELETE /sources/:id
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):**
```json
{
  "message": "Deleted successfully"
}
```

---

## 🔔 Notifications API

Quản lý thông báo của người dùng

### Lấy danh sách thông báo

```
GET /notifications
```

**Yêu cầu:** JWT token

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Báo cáo được duyệt",
    "message": "Báo cáo của bạn đã được xác nhận",
    "isRead": false,
    "createdAt": "2025-12-04T10:30:00Z"
  }
]
```

### Đánh dấu thông báo đã đọc

```
PATCH /notifications/:id/read
```

**Yêu cầu:** JWT token

**Response (200 OK):**
```json
{
  "id": 1,
  "isRead": true
}
```

---

## 📝 Reports API

Quản lý báo cáo vấn đề từ công dân

### Lấy danh sách báo cáo công khai

```
GET /reports/public
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Lỗ trên đường Đại Cồ Việt",
    "description": "Có lỗ sâu trên đường, nguy hiểm",
    "status": "APPROVED",
    "location": {
      "type": "Point",
      "coordinates": [105.8412, 21.0203]
    },
    "imageUrl": "https://...",
    "createdAt": "2025-12-04T10:30:00Z",
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A"
    }
  }
]
```

### Lấy báo cáo của tôi

```
GET /reports/my-reports
```

**Yêu cầu:** JWT token

**Response (200 OK):** Danh sách báo cáo của user hiện tại

### Tạo báo cáo mới

```
POST /reports
Content-Type: multipart/form-data
```

**Yêu cầu:** JWT token

**Form Data:**
- `title` (string) — Tiêu đề báo cáo
- `description` (string) — Mô tả chi tiết
- `latitude` (float) — Tọa độ vĩ độ
- `longitude` (float) — Tọa độ kinh độ
- `category` (string) — Loại báo cáo (INFRASTRUCTURE, TRAFFIC, CLEANLINESS, v.v.)
- `image` (file, optional) — Ảnh chứng minh

**Response (201 Created):**
```json
{
  "id": 2,
  "title": "Lỗi mới phát hiện",
  "status": "PENDING",
  "createdAt": "2025-12-04T11:30:00Z"
}
```

### Cập nhật báo cáo

```
PATCH /reports/:id
```

**Yêu cầu:** JWT token + Chủ báo cáo

**Request Body:**
```json
{
  "title": "Tiêu đề mới",
  "description": "Mô tả mới"
}
```

**Response (200 OK):** Báo cáo được cập nhật

### Xóa báo cáo

```
DELETE /reports/:id
```

**Yêu cầu:** JWT token + Chủ báo cáo hoặc Admin

**Response (200 OK):**
```json
{
  "message": "Report deleted successfully"
}
```

### Lấy chi tiết báo cáo

```
GET /reports/:id
```

**Response (200 OK):** Thông tin chi tiết báo cáo

### [Admin] Lấy tất cả báo cáo

```
GET /reports/admin/all
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):** Danh sách tất cả báo cáo

### [Admin] Lấy thống kê báo cáo

```
GET /reports/admin/stats
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):**
```json
{
  "total": 100,
  "pending": 45,
  "approved": 40,
  "rejected": 15
}
```

### [Admin] Duyệt báo cáo

```
PATCH /reports/:id/approve
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "APPROVED"
}
```

### [Admin] Từ chối báo cáo

```
PATCH /reports/:id/reject
```

**Yêu cầu:** JWT token + Admin role

**Request Body:**
```json
{
  "reason": "Thông tin không chính xác"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "REJECTED"
}
```

### [Admin] Đánh dấu đã xử lý

```
PATCH /reports/:id/resolve
```

**Yêu cầu:** JWT token + Admin role

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "RESOLVED"
}
```

---

## 📊 History & Charts API

Truy vấn dữ liệu lịch sử và biểu đồ

### Lấy dữ liệu biểu đồ

```
GET /history/chart
```

**Query Parameters:**
- `entityId` (string, bắt buộc) — ID của entity (URL encoded)
- `attr` (string, bắt buộc) — Tên thuộc tính: `temperature`, `humidity`, `precipitation`, `pm25`, `co`, `no2`, `so2`, `o3`
- `hours` (int) — Số giờ quá khứ (default: 24)

**Ví dụ:**
```bash
GET /history/chart?entityId=urn%3Angsi-ld%3AWeatherObserved%3AOpenWeatherMap%3A1566083&attr=temperature&hours=24

GET /history/chart?entityId=urn%3Angsi-ld%3AAirQualityObserved%3AAirQuality%3ALat21.03_Lon105.83&attr=pm25&hours=24
```

**Response (200 OK):**
```json
{
  "labels": ["10:00", "11:00", "12:00", "13:00"],
  "datasets": [
    {
      "label": "TEMPERATURE",
      "data": [26.5, 27.1, 27.8, 28.2],
      "borderColor": "rgb(53, 162, 235)",
      "backgroundColor": "rgba(53, 162, 235, 0.5)"
    }
  ]
}
```

---

## 🗺️ Map Search API

Tìm kiếm địa điểm gần vị trí

### Tìm kiếm bãi đỗ xe / địa điểm gần vị trí

```
GET /map/search-nearby
```

**Query Parameters:**
- `lat` (float, bắt buộc) — Vĩ độ
- `lon` (float, bắt buộc) — Kinh độ
- `category` (string) — Loại địa điểm: `parking`, `bus`, `poi` (default: parking)
- `radius` (int) — Bán kính tìm kiếm (mét, default: 1000)

**Ví dụ:**
```bash
GET /map/search-nearby?lat=21.0285&lon=105.8345&category=parking&radius=500

GET /map/search-nearby?lat=21.0285&lon=105.8345&category=bus&radius=1000
```

**Response (200 OK):**
```json
[
  {
    "id": "urn:ngsi-ld:OffStreetParking:P001",
    "type": "OffStreetParking",
    "name": { "value": "Bãi đỗ Tràng Thi" },
    "totalSpotNumber": { "value": 100 },
    "availableSpotNumber": { "value": 23 },
    "distance": 250,
    "location": {
      "type": "GeoProperty",
      "value": {
        "type": "Point",
        "coordinates": [105.8412, 21.0203]
      }
    }
  }
]
```

---

## 👨‍💼 Admin Endpoints

### Import dữ liệu tĩnh

```
POST /admin/import-static
```

**Yêu cầu:** JWT token + Admin role

**Query Parameters:**
- `category` (string) — Loại dữ liệu: `bus`, `parking` (default: bus)

**Ví dụ:**
```bash
POST /admin/import-static?category=bus
POST /admin/import-static?category=parking
```

**Response (200 OK):**
```json
{
  "message": "Import data completed",
  "imported": 150,
  "errors": 0
}
```

---

## ❌ Error Handling

### Status Codes

| Code | Ý nghĩa | Ví dụ |
|------|---------|-------|
| **200** | OK | Request thành công |
| **201** | Created | Tạo resource thành công |
| **400** | Bad Request | Tham số không hợp lệ |
| **401** | Unauthorized | Token không hợp lệ hoặc hết hạn |
| **403** | Forbidden | Không có quyền truy cập |
| **404** | Not Found | Resource không tồn tại |
| **409** | Conflict | Resource đã tồn tại |
| **500** | Server Error | Lỗi server |

### Ví dụ Error Response

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid limit parameter",
  "timestamp": "2025-12-04T11:30:00Z"
}
```


