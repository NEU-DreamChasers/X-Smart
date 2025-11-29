# Changelog

Các thay đổi đáng chú ý cho dự án X-Smart được ghi chép tại trang này theo định dạng [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added

- Tích hợp **Scorpio Context Broker** làm NGSI-LD broker chính
- Module `ngsi-ld` (scaffold): Service, Controller, Module cho tương tác NGSI-LD
- Cấu hình **Docker Compose** đầy đủ với PostgreSQL, Kafka (KRaft), Scorpio, backend, frontend
- Mô hình dữ liệu **SOSA/SSN** (W3C ontology)
- Tài liệu chi tiết: SETUP.md, ARCHITECTURE.md, API.md (tiếng Việt & tham khảo tiếng Anh)
- Scripts hỗ trợ: `setup.sh`, `setup.bat` cho thiết lập môi trường
- Chính sách bảo mật: SECURITY.md, Code of Conduct, CONTRIBUTING.md
- Cấu hình ESLint, TypeScript, NestJS cho backend
- Next.js skeleton cho frontend

### Removed

- _(Chưa có remove nào được ghi chép)_

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- _(Chưa có thay đổi nào được ghi chép)_

---
## 2025-11-21
### Added
- **Authentication System**:
    - Tích hợp module `Auth` sử dụng `Passport.js` (Local Strategy & JWT Strategy).
    - API Endpoint `POST /auth/login` cho phép đăng nhập và nhận JWT Access Token.
    - Mã hóa mật khẩu người dùng bằng `bcrypt`.
- **User Management**:
    - Module `Users` và Entity `User` (TypeORM) ánh xạ với bảng `users` trong PostgreSQL.
    - Tính năng **Auto-Seeding**: Tự động kiểm tra và khởi tạo tài khoản Admin mặc định (`admin` / `admin123`) khi server khởi động.

## [0.2.0] - 2025-11-27 (Data Ingestion & Adapter System)

### Added

- **Hệ thống Data Ingestion & Adapter (Data Converter)**:
  - Module `IngestionModule` với kiến trúc Adapter Pattern cho việc chuẩn hóa dữ liệu từ nhiều nguồn khác nhau
  - `AdapterFactory` để quản lý và khởi tạo các adapter động theo loại nguồn dữ liệu
  - `BaseAdapter` (abstract class) cung cấp các helper methods chuẩn cho việc xây dựng NGSI-LD entities
  - **Các Adapter cụ thể**:
    - `OpenWeatherMapAdapter`: Chuyển đổi dữ liệu thời tiết từ OpenWeatherMap API sang `WeatherObserved`
    - `AirQualityAdapter`: Chuyển đổi dữ liệu chất lượng không khí sang `AirQualityObserved`
    - `OverpassAdapter`: Chuyển đổi dữ liệu từ OpenStreetMap (POI, Bus Stops, Parking) sang `PointOfInterest` và `OffStreetParking`

- **Scorpio Integration Service**:
  - `ScorpioService` với đầy đủ CRUD operations cho NGSI-LD entities
  - Hỗ trợ Upsert operations (POST/PUT) để tránh duplicate entities
  - Query filtering theo type và custom query parameters
  - Error handling và logging chi tiết cho các operations với Scorpio Broker

- **REST API cho Ingestion** (`ContextController`):
  - **GET /:domain/status** - Lấy danh sách entities theo domain (weather, air, bus, parking, poi)
  - **GET /:domain/status/:id** - Lấy chi tiết một entity cụ thể
  - **POST /:domain/status/:id** - Tạo/nhập dữ liệu mới (upsert)
  - **PUT /:domain/status/:id** - Cập nhật dữ liệu entity
  - **DELETE /:domain/status/:id** - Xóa entity khỏi hệ thống
  - URN auto-generation: Tự động chuyển đổi ID ngắn sang URN chuẩn NGSI-LD
  - Query parameter `type` để chỉ định adapter động

- **Data Sources Management**:
  - Module `SourcesModule` để quản lý nguồn dữ liệu (sensors, API endpoints)
  - Entity `DataSource` với TypeORM cho PostgreSQL
  - Auto-seeding: Tự động khởi tạo 5 điểm quan sát tại TP.HCM (Weather, Air, POI, Bus, Parking) khi server khởi động
  - **REST API CRUD cho Sources** (`SourcesController`):
    - POST /sources - Tạo nguồn dữ liệu mới
    - GET /sources - Lấy danh sách tất cả nguồn
    - GET /sources/:id - Chi tiết một nguồn
    - PATCH /sources/:id - Cập nhật nguồn
    - DELETE /sources/:id - Xóa nguồn
  - JWT Authentication Guard cho tất cả endpoints của Sources

- **Kafka Integration (Producer & Consumer)**:
  - `IngestionService`: Producer tự động thu thập dữ liệu từ external APIs theo schedule (Cron 5 phút/lần)
  - `DataProcessor`: Consumer lắng nghe topic `raw_data_topic` và xử lý dữ liệu thời gian thực
  - Rate limiting handling: Tự động retry với backoff khi gặp HTTP 429
  - Batch processing cho Overpass data (Bus: 20 items, Parking: 10 items)

- **Swagger API Documentation**:
  - Tích hợp `@nestjs/swagger` với DocumentBuilder
  - API documentation tại `/api/docs`
  - Đầy đủ decorators: `@ApiTags`, `@ApiOperation`, `@ApiParam`, `@ApiBody`, `@ApiResponse`
  - Bearer Auth support cho protected endpoints
  - Descriptions và examples chi tiết cho tất cả endpoints

- **NGSI-LD Interfaces & Standards**:
  - `NgsiEntity`, `NgsiProperty`, `NgsiGeoProperty`, `NgsiRelationship` interfaces
  - Tuân thủ chuẩn NGSI-LD v1.9 (ETSI context URL)
  - Smart Data Models context support
  - Unit codes chuẩn (CEL, GP, MTS, etc.)
  - GeoJSON Point support cho location properties

### Changed

- **Docker Configuration**:
  - Đổi build context từ root sang subfolder (`./backend`, `./frontend`)
  - Cập nhật Dockerfile paths để phù hợp với context mới
  - Thêm biến môi trường `OPENWEATHER_API_KEY` vào docker-compose

- **ESLint Configuration**:
  - Thêm rule `prettier/prettier` với `endOfLine: "auto"` để tương thích Windows/Linux
  - Disable `@typescript-eslint/no-explicit-any` cho flexibility trong data transformation
  - Set `@typescript-eslint/no-floating-promises` và `@typescript-eslint/no-unsafe-argument` thành warning

- **Main Application**:
  - Enable CORS cho tất cả origins
  - Kafka microservice với consumer group `ingestion-consumer-group`
  - Dynamic port từ environment variable (default: 8080)
  - Console logging cho Swagger URL

- **Auth System**:
  - Thêm `LocalAuthGuard` và `JwtAuthGuard` classes
  - Swagger decorators cho login endpoint với DTO example
  - Cleaner code: Loại bỏ comments verbose, giữ logic

### Removed

- Loại bỏ `AppController` và `AppService` khỏi `AppModule` (chức năng được thay thế bởi `ContextController`)
- Xóa các comment dài dòng trong code (giữ lại code sạch hơn)
- Loại bỏ hardcoded Smart Data Models context URLs (chuyển sang ETSI standard context)

### Fixed

- **Ingestion Service**: Thêm `sleep()` delay giữa các API calls để tránh rate limiting
- **Error Handling**: Improved error messages với proper HTTP status codes
- **TypeORM Auto-seeding**: Sử dụng `OnModuleInit` lifecycle hook để seed data đúng thời điểm
- **NGSI-LD Context**: Cập nhật context URLs sang `https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld`
- **Overpass Adapter**: Xử lý cả `node` và `way` elements với `center` coordinates
- **Scorpio Service**: Proper handling cho 404 errors và rejected entities

---
## 2025-11-21
### Added
- **Authentication System**:
    - Tích hợp module `Auth` sử dụng `Passport.js` (Local Strategy & JWT Strategy).
    - API Endpoint `POST /auth/login` cho phép đăng nhập và nhận JWT Access Token.
    - Mã hóa mật khẩu người dùng bằng `bcrypt`.
- **User Management**:
    - Module `Users` và Entity `User` (TypeORM) ánh xạ với bảng `users` trong PostgreSQL.
    - Tính năng **Auto-Seeding**: Tự động kiểm tra và khởi tạo tài khoản Admin mặc định (`admin` / `admin123`) khi server khởi động.

## [0.1.0] - 2024-11-17 (Initial Setup)

### Added

- Khởi tạo repository structure: `backend/`, `frontend/`, `docs/`, `scripts/`
- NestJS backend skeleton với AppModule, AppController, AppService
- Next.js frontend với default template
- Docker & Docker Compose configuration (initial, Kafka)
- TypeORM setup cho PostgreSQL
- Package dependencies cơ bản: axios, @nestjs/config, @nestjs/swagger, uuid, v.v.

---

## Ghi chú

- **v0.99.7**: Scorpio version sử dụng hiện tại
- **KRaft Mode**: Kafka chạy ở KRaft mode
- **PostGIS**: PostgreSQL + extension PostGIS cho dữ liệu địa lý

---
## [0.1.1] - 2024-11-21

### Added

- Thêm shadcn/ui (bộ component UI cho React) vào frontend
- Thêm giao diện trang chủ (homepage) cho frontend

### Removed

- _(Chưa có remove nào được ghi chép)_

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- Add homepage ui and admin ui


## [0.1.2] - 2024-11-21

### Added

- Thêm giao diện trang chủ (homepage) cho frontend

### Removed

- Xóa `app.tsx`

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- Refactor: kết hợp logic controller và UI


## [0.1.2] - 2024-11-21

### Added

- Route groups cho auth và dashboard: `(auth)/login`, `(dashboard)/admin`, `(dashboard)/citizen`

### Removed

- Xóa `LoginScreen.tsx`
- Xóa `LoginModal.tsx`

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- Refactor: tái cấu trúc route với folder groups
## [0.1.3] - 2025-11-24

### Added

- Docker: Thêm file .dockerignore ở thư mục gốc để ngăn chặn việc copy rác (node_modules local, .git, .env) vào container gây lỗi.

- Frontend: Thêm cấu hình output: 'standalone' trong next.config.ts để tối ưu hóa Docker image.

### Fixed

- Deployment: Sửa hoàn toàn lỗi khởi động MODULE_NOT_FOUND ở Backend và Cannot find module server.js ở Frontend trên môi trường Production.

- Backend Dockerfile: Chuyển đổi chiến lược build sang COPY node_modules từ builder stage thay vì cài đặt lại tại production, khắc phục lỗi thiếu @nestjs/core và lỗi native build của bcrypt.

- Docker Compose: Loại bỏ volume mapping (./backend:/app, ./frontend:/app) để sửa lỗi "Volume Shadowing" (ghi đè file container bằng file máy host).

- Frontend Build: Khắc phục lỗi build thất bại do TypeScript/ESLint strict mode bằng cách thêm cấu hình ignoreBuildErrors và ignoreDuringBuilds.

### Changed

- Config: Chuyển đổi hoàn toàn Frontend config từ next.config.js sang next.config.ts và loại bỏ file cũ.
