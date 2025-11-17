# X-Smart

> Nền tảng dữ liệu mở cho đô thị thông minh (Open Data Platform for Smart Cities)

**X-Smart** là một dự án mã nguồn mở xây dựng nền tảng quản lý và trực quan hoá dữ liệu cho các thành phố thông minh, sử dụng các tiêu chuẩn mở và kiến trúc microservices.

## Tính năng chính

- **NGSI-LD Context Broker** (Scorpio) — quản lý entity theo chuẩn ETSI
- **Backend NestJS** — REST API wrapper cho NGSI-LD, xử lý batch entities
- **Frontend Next.js** — dashboard tương tác, trực quan hoá dữ liệu, bản đồ
- **SOSA/SSN Ontology** — mô tả sensor, observation, property
- **FiWARE Smart Data Models** — kiểu dữ liệu cụ thể (WeatherObserved, AirQualityObserved, ...)
- **PostgreSQL + PostGIS** — lưu trữ dữ liệu không gian
- **Kafka (KRaft)** — streaming event cho subscription & notification
- **Docker Compose** — triển khai toàn bộ hệ thống với một lệnh

## Yêu cầu trước

- Docker & Docker Compose (v20.10+)
- Node.js (v18+) — cho phát triển cục bộ
- Git

## Khởi động nhanh

### 1. Clone repository

```bash
git clone https://github.com/NEU-DreamChasers/X-Smart.git
cd X-Smart
```

### 2. Chạy toàn bộ hệ thống

```bash
docker-compose up -d
```

### 3. Kiểm tra Scorpio

```bash
curl http://localhost:9090/ngsi-ld/v1/info
```

### 4. Truy cập frontend

Mở trình duyệt: `http://localhost:3000`

## Cấu trúc dự án

```
X-Smart/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── ngsi-ld/   # NGSI-LD service/controller (scaffold)
│   │   ├── sosa-ssn/  # SOSA/SSN models
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
├── frontend/          # Next.js web dashboard
│   ├── src/app/
│   ├── package.json
│   └── Dockerfile
├── docs/              # Documentation (Việt, Anh)
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── ...
├── scripts/           # Helper scripts
│   ├── setup.sh
│   ├── setup.bat
│   └── ...
├── docker-compose.yml # Full stack orchestration
└── README.md          # This file
```

## Dịch vụ chính

| Dịch vụ        | Cổng | Mô tả                           |
| -------------- | ---- | ------------------------------- |
| **Scorpio**    | 9090 | NGSI-LD Context Broker (FIWARE) |
| **Backend**    | 8080 | NestJS REST API                 |
| **Frontend**   | 3000 | Next.js Dashboard               |
| **PostgreSQL** | 5432 | Database (+ PostGIS)            |
| **Kafka**      | 9092 | Message Bus (KRaft mode)        |

## Tài liệu

- [SETUP.md](./docs/SETUP.md) — Hướng dẫn thiết lập chi tiết
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Kiến trúc hệ thống
- [DEPENDENCIES.md](./docs/DEPENDENCIES.md) — Phụ thuộc, library, packages & lý do lựa chọn
- [API.md](./docs/API.md) — Tài liệu API
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Quy trình đóng góp
- [SECURITY.md](./docs/SECURITY.md) — Chính sách bảo mật

## Ví dụ sử dụng

### Tạo một entity WeatherObserved

```bash
curl -X POST "http://localhost:8080/api/entities" \
  -H "Content-Type: application/ld+json" \
  -d '{
    "type": "WeatherObserved",
    "temperature": { "type": "Property", "value": 25.5 },
    "location": { "type": "GeoProperty", "value": { "type": "Point", "coordinates": [105.83, 21.03] } }
  }'
```

### Truy vấn entities

```bash
curl "http://localhost:8080/api/entities?type=WeatherObserved&limit=10"
```

## Phát triển cục bộ

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Công nghệ sử dụng

- **Backend**: TypeScript, NestJS, TypeORM, Axios
- **Frontend**: React, Next.js, TypeScript
- **Broker**: Scorpio (Java/Quarkus)
- **Database**: PostgreSQL 16, PostGIS
- **Message Bus**: Kafka (KRaft)
- **Containers**: Docker, Docker Compose

## Các cải tiến trong tương lai

- [ ] Thêm real data adapters (OpenWeatherMap, OpenAQ, OSM, GTFS)
- [ ] Truy vấn nâng cao (temporal, geospatial, aggregations)
- [ ] Subscriptions & notifications (webhook, MQTT)
- [ ] Authentication & authorization
- [ ] Dashboards & analytics
- [ ] Kubernetes support

## Tham gia đóng góp

Mọi đóng góp đều được chào đón! Vui lòng đọc [CONTRIBUTING.md](./docs/CONTRIBUTING.md) để biết quy trình.

## Giấy phép

Dự án này được cấp phép dưới giấy phép [LICENSE](./LICENSE).

## Liên hệ & Hỗ trợ

- GitHub Issues: Báo bug hoặc đề xuất tính năng
- Discussions: Thảo luận chung
- Email: contact@neudreamchasers.example (thay bằng email thực tế)

---

Xây dựng với ❤️ bởi **NEU-DreamChasers** dành cho cuộc thi phần mềm mã nguồn mở
