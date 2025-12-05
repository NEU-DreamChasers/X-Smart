# 🏗️ Architecture — X-Smart

> Kiến trúc hệ thống nền tảng dữ liệu mở cho đô thị thông minh

---

## 🔍 Giới thiệu

**X-Smart** là nền tảng **dữ liệu mở (Open Data Platform)** cho đô thị thông minh, xây dựng trên:

- 🔗 **NGSI-LD** (ETSI) — Tiêu chuẩn linked data cho IoT
- 🌐 **SOSA/SSN** (W3C) — Ontology cảm biến quan sát
- 🏙️ **FiWARE Smart Data Models** — Mô hình dữ liệu cho thành phố thông minh

**Mục tiêu:**
- Tập trung hóa dữ liệu từ nhiều nguồn (thời tiết, không khí, giao thông, bãi đỗ xe)
- Chuẩn hoá và kết nối dữ liệu theo tiêu chuẩn quốc tế
- Cung cấp API unified cho tất cả dữ liệu thành phố
- Hỗ trợ phân tích, trực quan hoá và báo cáo

---

## 📊 Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│         Dashboard | Maps | Analytics | User Reports             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────────┐
│                    Backend (NestJS)                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐        │
│  │   Auth      │  │   Reports    │  │  Data Ingestion  │        │
│  │ (JWT/OAuth) │  │   Module     │  │    Adapters      │        │
│  └─────────────┘  └──────────────┘  └──────────────────┘        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Scorpio Context Broker (NGSI-LD)            │   │
│  │  Entity Management | Subscriptions | Queries             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────┬─────────────────────┘
               │                            │
    ┌──────────▼─────────┐      ┌───────────▼──────────┐
    │  PostgreSQL 16     │      │  Kafka (KRaft)       │
    │  + PostGIS         │      │  Message Bus         │
    │  Entity Storage    │      │  Event Streaming     │
    │  Spatial Queries   │      │  Notifications       │
    └────────────────────┘      └──────────────────────┘

    ┌──────────────────┐      ┌──────────────────┐
    │   MinIO (S3)     │      │  External APIs   │
    │  Report Storage  │      │ OpenWeatherMap   │
    │  File Upload     │      │ OpenAQ, OSM, GTFS│
    └──────────────────┘      └──────────────────┘
```

---

## 🧩 Thành phần chính

### 1. Frontend Layer (Next.js 16)

**Tệp chính:** `frontend/src/`

**Chức năng:**
- 📊 Dashboard tương tác (thời tiết, không khí, giao thông)
- 🗺️ Bản đồ interaktif (Leaflet.js + clustering)
- 📈 Biểu đồ & phân tích (Recharts)
- 👥 Quản lý báo cáo công dân
- 🔐 Xác thực người dùng (JWT + Google OAuth)

**Công nghệ:**
- React 19, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI
- Recharts (biểu đồ)
- Leaflet.js (bản đồ)

---

### 2. Backend Layer (NestJS)

**Tệp chính:** `backend/src/`

**Các module chính:**

#### a. **Authentication Module** (`auth/`)
- JWT + Passport strategies
- Google OAuth2 callback
- Role-based access control (RBAC)

#### b. **Ingestion Module** (`ingestion/`)
- Data adapters (OpenWeatherMap, OpenAQ, OSM, GTFS)
- Transform raw data → NGSI-LD entities
- Batch upsert to Scorpio

**Adapters:**
```
factory/adapter.factory.ts
  ├── openweathermap.adapter.ts
  ├── openweathermap_aqi.adapter.ts
  ├── overpass.adapter.ts
```

#### c. **Context/Entity Module** (`ingestion/context.controller.ts`)
- GET /:domain/status — Lấy entities theo domain
- POST /:domain/status/:id — Gửi dữ liệu
- PUT /:domain/status/:id — Cập nhật
- DELETE /:domain/status/:id — Xóa

#### d. **History Module** (`history/`)
- Lấy dữ liệu lịch sử từ PostgreSQL
- Tạo biểu đồ (temporal aggregation)

#### e. **Reports Module** (`reports/`)
- CRUD báo cáo công dân
- Admin approval workflow
- File upload (MinIO)

#### f. **Sources Module** (`sources/`)
- Quản lý nguồn dữ liệu
- CRUD data sources
- Adapter configuration

#### g. **Notifications Module** (`notifications/`)
- Thông báo người dùng
- Mark as read
- Event-driven (Kafka)

#### h. **Scorpio Module** (`scorpio/`)
- Tương tác với Scorpio Context Broker
- Entity CRUD operations
- Subscriptions & queries

---

### 3. Scorpio Context Broker

**Cổng:** `9090`

**Chức năng:**
- Lưu trữ entities NGSI-LD
- Quản lý subscriptions
- Temporal queries
- Geospatial queries

**API chính:**
```
POST   /ngsi-ld/v1/entities              — Tạo entity
GET    /ngsi-ld/v1/entities              — Lấy danh sách
GET    /ngsi-ld/v1/entities/:id          — Chi tiết
PATCH  /ngsi-ld/v1/entities/:id/attrs    — Cập nhật thuộc tính
DELETE /ngsi-ld/v1/entities/:id          — Xóa
POST   /ngsi-ld/v1/subscriptions         — Tạo subscription
POST   /ngsi-ld/v1/entityOperations/upsert — Batch upsert
```

---

### 4. PostgreSQL 16 + PostGIS

**Database:** `x-smart-db`

**Tables chính:**
```sql
-- Reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'),
  location GEOMETRY(Point, 4326),
  image_url VARCHAR(255),
  user_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('USER', 'ADMIN'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sources (Data Sources)
CREATE TABLE sources (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  adapter_type VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. Kafka (KRaft Mode)

**Cổng:** `29092` (broker)

**Chức năng:**
- Event streaming
- Notifications
- Async processing
- Real-time data pipeline

**Topics:**
```
x-smart.entities.created
x-smart.entities.updated
x-smart.entities.deleted
x-smart.reports.created
x-smart.reports.updated
x-smart.notifications
```

---

### 6. MinIO (S3-Compatible Storage)

**Cổng:** `9000`, `9001` (console)

**Chức năng:**
- Lưu trữ ảnh báo cáo
- Upload file từ users
- S3-compatible API

**Buckets:**
```
x-smart-reports/   — Report images
x-smart-uploads/   — User files
```

---

## 🔄 Luồng dữ liệu

### Luồng 1: Dữ liệu từ Sensor → Dashboard

```
1. Sensor/API externa (OpenWeatherMap, OpenAQ, etc.)
   │
2. Backend Adapter (ingestion/adapters/)
   │ Transform → NGSI-LD
3. Scorpio Context Broker
   │ Store entity
4. PostgreSQL + PostGIS
   │ Persist data
5. Frontend API Call (GET /weather/status)
   │
6. Dashboard Display
```

### Luồng 2: Báo cáo từ Công dân

```
1. User tạo báo cáo (POST /reports)
   │ Upload ảnh → MinIO
   │
2. Backend lưu vào PostgreSQL
   │
3. Admin nhận thông báo (Kafka → Notifications)
   │
4. Admin duyệt/từ chối
   │
5. Notification gửi lại User
```

### Luồng 3: Biểu đồ & Phân tích

```
1. Frontend yêu cầu chart data
   │ GET /history/chart?entityId=...&attr=temperature
   │
2. Backend truy vấn PostgreSQL (temporal aggregation)
   │ SELECT date_trunc('hour', observed_at) as hour,
   │        AVG(value) as avg_value
   │ FROM entity_values WHERE entity_id = ? GROUP BY hour
   │
3. Format dữ liệu → Recharts
   │
4. Display biểu đồ
```

---

## 🔗 Công nghệ & Tiêu chuẩn

### Tiêu chuẩn Mở

| Tiêu chuẩn | Tổ chức | Ứng dụng |
|-----------|--------|---------|
| **NGSI-LD** | ETSI | Linked data model cho entities |
| **SOSA/SSN** | W3C | Sensor & observation ontology |
| **FiWARE Smart Data Models** | FIWARE | Kiểu dữ liệu cho thành phố thông minh |
| **JSON-LD** | W3C | Serialization format |
| **GeoJSON** | IETF | Geospatial data format |

### Tech Stack

| Layer | Công nghệ | Phiên bản |
|-------|----------|---------|
| **Frontend** | Next.js | 16 |
| | React | 19 |
| | TypeScript | 5.x |
| | Tailwind CSS | 3.x |
| **Backend** | NestJS | 10.x |
| | TypeScript | 5.x |
| | TypeORM | 0.3.x |
| **NGSI-LD Broker** | Scorpio | Latest |
| **Database** | PostgreSQL | 16 |
| | PostGIS | 3.x |
| **Message Bus** | Kafka | 3.x (KRaft) |
| **Storage** | MinIO | Latest |
| **Containerization** | Docker Compose | 3.x |
| **Authentication** | JWT + Passport | - |

---

## 📋 Mô hình dữ liệu

### Entity Structure (NGSI-LD)

```json
{
  "id": "urn:ngsi-ld:WeatherObserved:OpenWeatherMap:1566083",
  "type": "WeatherObserved",
  "name": {
    "type": "Property",
    "value": "Hà Nội"
  },
  "temperature": {
    "type": "Property",
    "value": 26.5,
    "unitCode": "CEL"
  },
  "humidity": {
    "type": "Property",
    "value": 65,
    "unitCode": "P1"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [105.8345, 21.0285]
    }
  },
  "observedAt": {
    "type": "Property",
    "value": "2025-12-04T10:30:00Z"
  },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Weather/master/context.jsonld"
  ]
}
```

### Property vs Relationship

```json
{
  "id": "urn:ngsi-ld:OffStreetParking:P001",
  "type": "OffStreetParking",
  "name": { "type": "Property", "value": "Bãi đỗ A" },
  "totalSpotNumber": { "type": "Property", "value": 100 },
  "availableSpotNumber": { "type": "Property", "value": 23 },
  
  "managedBy": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Organization:CityCouncil"
  }
}
```

---

## 🎯 Entity Types

X-Smart hỗ trợ các entity types sau (theo FiWARE Smart Data Models):

### Weather Domain
- `WeatherObserved` — Dữ liệu thời tiết (nhiệt độ, độ ẩm, gió, mưa)

### Air Quality Domain
- `AirQualityObserved` — Chất lượng không khí (PM2.5, PM10, O3, NO2, SO2, CO)

### Mobility Domain
- `PointOfInterest` — Điểm quan tâm (xe bus, bãi đỗ xe, cơ sở công cộng)
- `OffStreetParking` — Bãi đỗ xe
- `PublicTransportRoute` — Tuyến giao thông công cộng

### City Domain
- `Report` — Báo cáo từ công dân
- `DataSource` — Nguồn dữ liệu

---

## 🔌 API Endpoints

### Entity Operations

```
GET    /:domain/status              — Danh sách entities
GET    /:domain/status/:id          — Chi tiết
POST   /:domain/status/:id          — Tạo/gửi dữ liệu
PUT    /:domain/status/:id          — Cập nhật
DELETE /:domain/status/:id          — Xóa
```

### History & Charts

```
GET    /history/chart               — Dữ liệu biểu đồ (temporal)
```

### Map Search

```
GET    /map/search-nearby           — Tìm kiếm địa điểm gần vị trí
```

### Reports

```
GET    /reports/public              — Báo cáo công khai
POST   /reports                     — Tạo báo cáo
GET    /reports/my-reports          — Báo cáo của tôi
PATCH  /reports/:id/approve         — Duyệt (Admin)
PATCH  /reports/:id/reject          — Từ chối (Admin)
PATCH  /reports/:id/resolve         — Đánh dấu đã xử lý (Admin)
```

### Sources

```
GET    /sources                     — Danh sách nguồn
POST   /sources                     — Tạo nguồn
PATCH  /sources/:id                 — Cập nhật
DELETE /sources/:id                 — Xóa
```

---

## 🗄️ Database Schema

### Relationships

```
users (1) ──→ (N) reports
users (1) ──→ (N) notifications
sources (1) ──→ (N) entities
```

### Key Indexes

```sql
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON reports(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_sources_adapter_type ON sources(adapter_type);
```

---

## 📡 Message Bus & Sự kiện

### Kafka Topics

**Định dạng:** `x-smart.<resource>.<action>`

| Topic | Người gửi | Người nhận | Dữ liệu |
|-------|----------|----------|---------|
| `x-smart.entities.created` | Backend | Notifications | `{ entityId, type, timestamp }` |
| `x-smart.entities.updated` | Backend | Analytics | `{ entityId, changes, timestamp }` |
| `x-smart.reports.created` | Reports API | Notifications | `{ reportId, userId, title }` |
| `x-smart.reports.approved` | Admin | Notifications | `{ reportId, userId }` |
| `x-smart.notifications` | Various | Frontend (WebSocket) | `{ userId, message }` |

### Luồng sự kiện

```
Backend API → Kafka Topic → Dịch vụ thông báo → Database → Email/WebSocket
```

---

## 🔐 Bảo mật & Xác thực

### Luồng xác thực

```
1. User đăng nhập (POST /auth/login)
   │ Username + Password
   │ ↓
2. Backend xác thực → tạo JWT
   │ ↓
3. Frontend lưu JWT (localStorage)
   │ ↓
4. Các request tiếp theo gửi kèm JWT header
   │ Authorization: Bearer <token>
   │ ↓
5. Backend xác thực JWT → kiểm tra claims (userId, role)
   │ ↓
6. Nếu hợp lệ → xử lý request
   Nếu không hợp lệ → 401 Unauthorized
```

### Phân quyền (RBAC)

```
USER (Người dùng):
  - Đọc dữ liệu công khai (/weather/status, /air/status, etc.)
  - Tạo báo cáo (POST /reports)
  - Đọc báo cáo của mình
  - Đọc thông báo

ADMIN (Quản trị viên):
  - Tất cả quyền của USER
  - Duyệt/từ chối báo cáo
  - Quản lý nguồn dữ liệu
  - Import dữ liệu tĩnh
  - Xem phân tích
  - Quản lý người dùng
```

### Bảo mật mật khẩu

- Mã hóa Bcrypt
- Salt rounds: 10
- Độ dài tối thiểu: 8 ký tự

---

## 🚀 Triển khai

### Dịch vụ Docker

```yaml
services:
  backend:      # NestJS API server
  frontend:     # Next.js dev server
  scorpio:      # Context Broker
  postgres:     # Database
  kafka:        # Message Bus (KRaft)
  minio:        # S3 Storage
  redis:        # Cache (optional)
```

### Biến môi trường

```bash
# Backend
DATABASE_URL=postgresql://user:pass@postgres:5432/x-smart
SCORPIO_URL=http://scorpio:9090
KAFKA_BROKERS=kafka:29092
JWT_SECRET=your_secret
OPENWEATHERMAP_API_KEY=your_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

### Cổng (Ports)

| Dịch vụ | Cổng | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8080 | http://localhost:8080/api |
| Scorpio | 9090 | http://localhost:9090 |
| PostgreSQL | 5432 | localhost:5432 |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |
| Kafka Broker | 29092 | localhost:29092 |

