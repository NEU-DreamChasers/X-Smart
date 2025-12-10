# 📦 Phụ Thuộc & Dependencies (Tech Stack)

> **Tài liệu quản lý phụ thuộc toàn diện cho X-Smart Platform**  
> Mô tả chi tiết các thư viện, frameworks, và công nghệ được sử dụng trong dự án

---

## 📑 Mục Lục

- [Tổng Quan Hệ Thống](#-tổng-quan-hệ-thống)
- [Backend Dependencies](#-backend-dependencies)
  - [Core Framework](#core-framework-nestjs)
  - [HTTP & API](#http--api)
  - [Authentication & Security](#authentication--security)
  - [Database & ORM](#database--orm)
  - [Message Queue & Events](#message-queue--events)
  - [Storage & Files](#storage--files)
  - [Validation & Transformation](#validation--transformation)
  - [Documentation](#documentation)
  - [Utilities](#utilities)
  - [Dev Dependencies](#dev-dependencies-backend)
- [Frontend Dependencies](#-frontend-dependencies)
  - [Core Framework](#core-framework-react--nextjs)
  - [UI Components & Styling](#ui-components--styling)
  - [Mapping & Visualization](#mapping--visualization)
  - [Charts & Data Visualization](#charts--data-visualization)
  - [HTTP Client](#http-client)
  - [Dev Dependencies](#dev-dependencies-frontend)
- [Shared Dependencies](#-shared-dependencies)
- [Infrastructure & Docker Stack](#-infrastructure--docker-stack)
- [Standards & Specifications](#-standards--specifications)
- [Dependency Management](#-dependency-management)
  - [Phiên Bản Node.js & NPM](#phiên-bản-nodejs--npm)
  - [Chiến Lược Versioning](#chiến-lược-versioning)
  - [Quy Trình Cập Nhật](#quy-trình-cập-nhật)
- [Security & Vulnerabilities](#-security--vulnerabilities)
- [Update Policy](#-update-policy)
- [License Information](#-license-information)
- [Dependency Tree](#-dependency-tree)
- [Available Scripts](#-available-scripts)

---

## 🎯 Tổng Quan Hệ Thống

| Thành Phần            | Công Nghệ                          | Phiên Bản       | License   | Mục Đích                                    |
| --------------------- | ---------------------------------- | --------------- | --------- | ------------------------------------------- |
| **Backend**           | NestJS + TypeScript                | 11.0.1 + 5.7.3  | MIT       | REST API server với kiến trúc module       |
| **Frontend**          | Next.js + React                    | 16.0.3 + 19.2.0 | MIT       | Server-side rendering UI application       |
| **Database**          | PostgreSQL + PostGIS               | 16 + 3.4        | PostgreSQL| Relational database với geospatial support |
| **ORM**               | TypeORM                            | 0.3.27          | MIT       | Object-relational mapping framework        |
| **Context Broker**    | Scorpio NGSI-LD                    | latest          | BSD       | Smart city context information management  |
| **Message Bus**       | Apache Kafka (KRaft)               | 7.5.0           | Apache 2.0| Event streaming platform                   |
| **Object Storage**    | MinIO                              | latest          | Apache 2.0| S3-compatible file storage                 |
| **Container**         | Docker + Docker Compose            | 27+ + 2.29+     | Apache 2.0| Containerization & orchestration           |
| **Language**          | TypeScript                         | 5.7.3           | Apache 2.0| Static type checking for JavaScript        |

### 🔑 Lý Do Lựa Chọn Công Nghệ

| Lựa Chọn                 | Lý Do Chính                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **TypeScript**           | An toàn kiểu dữ liệu, phát hiện lỗi sớm, IntelliSense tốt hơn                       |
| **NestJS**               | Kiến trúc module rõ ràng, dependency injection, tích hợp sẵn Swagger, ưu tiên TypeScript |
| **Next.js 16**           | App Router, React Server Components, SSR/SSG, tối ưu hình ảnh, API routes          |
| **React 19**             | React Compiler, Server Actions, Form Actions, hook useOptimistic                    |
| **PostgreSQL + PostGIS** | Tuân thủ ACID, hỗ trợ JSON, truy vấn không gian (ST_Distance, ST_Within)           |
| **TypeORM**              | Migrations, quan hệ, query builder, hỗ trợ đa database                              |
| **Kafka (KRaft)**        | Chế độ KRaft (không cần ZooKeeper), streaming sự kiện real-time, mở rộng ngang     |
| **Scorpio NGSI-LD**      | Tuân chuẩn ETSI, truy vấn liên kết, biểu diễn thời gian                             |
| **Docker Compose**       | Môi trường dev giống production, dễ dàng điều phối services                         |
| **MinIO**                | Tương thích S3 API, tự host, phù hợp lưu trữ báo cáo                                |

---

## 🔧 Backend Dependencies

### Core Framework (NestJS)

```json
"dependencies": {
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1"
}
```

- **@nestjs/common** `11.0.1`
  - **Mục đích**: Các decorator cốt lõi, pipes, guards, interceptors
  - **Lý do**: Nền tảng của NestJS framework, cung cấp dependency injection container
  - **Thay đổi quan trọng**: v11 yêu cầu Node.js >= 20.0.0
  - **Phụ thuộc ngang hàng**: rxjs, reflect-metadata

- **@nestjs/core** `11.0.1`
  - **Mục đích**: Khởi tạo ứng dụng, hệ thống module, lifecycle hooks
  - **Lý do**: Công cụ cốt lõi của NestJS, xử lý chu trình request/response
  - **Tính năng chính**: Module caching, giải quyết phụ thuộc vòng tròn

- **@nestjs/platform-express** `11.0.1`
  - **Mục đích**: Express.js adapter cho NestJS
  - **Lý do**: Sử dụng Express làm HTTP server (thay thế: @nestjs/platform-fastify)
  - **Bao gồm**: Express, multer (hỗ trợ tải file lên)

### HTTP & API

```json
"dependencies": {
  "@nestjs/axios": "^4.0.1",
  "axios": "^1.13.2"
}
```

- **@nestjs/axios** `4.0.1`
  - **Mục đích**: NestJS wrapper cho Axios với tích hợp rxjs
  - **Lý do**: Gọi các API bên ngoài (thời tiết, giao thông, dịch vụ địa lý)
  - **Tính năng**: Hỗ trợ interceptors, API dựa trên Observable

- **axios** `1.13.2`
  - **Mục đích**: HTTP client dựa trên Promise cho browser và Node.js
  - **Lý do**: Chuẩn ngành, tự động chuyển đổi JSON, hỗ trợ interceptors cho request/response
  - **Lưu ý bảo mật**: Luôn xác thực dữ liệu từ API bên ngoài

### Authentication & Security

```json
"dependencies": {
  "@nestjs/passport": "^11.0.5",
  "@nestjs/jwt": "^11.0.1",
  "@nestjs/throttler": "^6.4.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-google-oauth20": "^2.0.0",
  "passport-local": "^1.0.0",
  "bcrypt": "^6.0.0"
}
```

- **@nestjs/passport** `11.0.5`
  - **Mục đích**: NestJS integration cho Passport.js authentication
  - **Lý do**: Flexible authentication strategies (JWT, OAuth, Local)
  - **Used in**: AuthModule, JWT/Google/Local strategies

- **@nestjs/jwt** `11.0.1`
  - **Mục đích**: JWT token generation và verification
  - **Lý do**: Stateless authentication cho REST API
  - **Configuration**: JWT_SECRET, JWT_EXPIRES_IN environment variables

- **@nestjs/throttler** `6.4.0`
  - **Mục đích**: Rate limiting protection
  - **Lý do**: Prevent brute-force attacks, API abuse
  - **Default**: 10 requests per 60 seconds (configurable)

- **bcrypt** `6.0.0`
  - **Mục đích**: Password hashing with salt rounds
  - **Lý do**: Industry-standard password security (better than MD5, SHA)
  - **Security**: Uses 10 salt rounds, ~100ms hashing time

### Database & ORM

```json
"dependencies": {
  "@nestjs/typeorm": "^11.0.0",
  "typeorm": "^0.3.27",
  "pg": "^8.16.3",
  "reflect-metadata": "^0.2.2"
}
```

- **@nestjs/typeorm** `11.0.0`
  - **Mục đích**: NestJS integration cho TypeORM
  - **Lý do**: Dependency injection cho repositories, entity auto-loading
  - **Features**: Connection management, transaction support

- **typeorm** `0.3.27`
  - **Mục đích**: TypeScript ORM cho SQL databases
  - **Lý do**: Type-safe queries, migrations, relations (OneToMany, ManyToOne)
  - **Breaking changes**: v0.3 requires explicit relations loading
  - **Migration**: CLI via `npm run typeorm migration:generate`

- **pg** `8.16.3`
  - **Mục đích**: PostgreSQL client cho Node.js
  - **Lý do**: Required by TypeORM for PostgreSQL connection
  - **Features**: Connection pooling, prepared statements, LISTEN/NOTIFY

- **reflect-metadata** `0.2.2`
  - **Mục đích**: Metadata reflection API polyfill
  - **Lý do**: **REQUIRED** for TypeORM decorators and NestJS dependency injection
  - **Import**: Must be imported in `main.ts` before any decorator usage

### Message Queue & Events

```json
"dependencies": {
  "@nestjs/microservices": "^11.1.9",
  "kafkajs": "^2.2.4"
}
```

- **@nestjs/microservices** `11.1.9`
  - **Mục đích**: Microservices patterns (Kafka, RabbitMQ, Redis, MQTT)
  - **Lý do**: Kafka integration cho event-driven architecture
  - **Used in**: IngestionModule, NotificationsModule

- **kafkajs** `2.2.4`
  - **Mục đích**: Kafka client cho Node.js
  - **Lý do**: Pure JavaScript implementation, no native dependencies
  - **Topics**: `weather-updates`, `air-quality-updates`, `report-notifications`

### Storage & Files

```json
"dependencies": {
  "minio": "^8.0.6",
  "nestjs-minio-client": "^2.2.0",
  "@nestjs/schedule": "^6.0.1"
}
```

- **minio** `8.0.6`
  - **Mục đích**: MinIO S3-compatible object storage client
  - **Lý do**: Store citizen report files (images, PDFs)
  - **Features**: Presigned URLs, bucket policies, multipart upload

- **nestjs-minio-client** `2.2.0`
  - **Mục đích**: NestJS wrapper cho MinIO client
  - **Lý do**: Dependency injection, configuration management
  - **Bucket**: `x-smart-reports`

- **@nestjs/schedule** `6.0.1`
  - **Mục đích**: Cron jobs scheduling
  - **Lý do**: Periodic data ingestion, cleanup tasks
  - **Used in**: IngestionService (hourly weather/air quality fetch)

### Validation & Transformation

```json
"dependencies": {
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "@nestjs/mapped-types": "^2.1.0"
}
```

- **class-validator** `0.14.0`
  - **Mục đích**: Decorator-based validation cho DTOs
  - **Lý do**: Type-safe validation (@IsEmail, @IsInt, @MinLength, @IsLatitude)
  - **Example**: `CreateReportDto`, `UpdateSourceDto`

- **class-transformer** `0.5.1`
  - **Mục đích**: Transform plain objects to class instances
  - **Lý do**: Works with ValidationPipe for automatic transformation
  - **Features**: @Exclude, @Expose, @Type, @Transform decorators

- **@nestjs/mapped-types** `2.1.0`
  - **Mục đích**: Helper functions (PartialType, PickType, OmitType)
  - **Lý do**: DRY principle for DTOs (e.g., UpdateSourceDto extends PartialType(CreateSourceDto))

### Documentation

```json
"dependencies": {
  "@nestjs/swagger": "^11.2.3",
  "swagger-ui-express": "^5.0.1"
}
```

- **@nestjs/swagger** `11.2.3`
  - **Mục đích**: OpenAPI/Swagger documentation auto-generation
  - **Lý do**: Automatic API docs from decorators (@ApiTags, @ApiResponse)
  - **Access**: http://localhost:3000/api

- **swagger-ui-express** `5.0.1`
  - **Mục đích**: Swagger UI rendering
  - **Lý do**: Interactive API documentation with "Try it out" feature

### Utilities

```json
"dependencies": {
  "uuid": "^9.0.1",
  "uid": "^2.0.2",
  "rxjs": "^7.8.1",
  "iterare": "^1.2.1",
  "geojson": "^0.5.0",
  "chardet": "^2.1.1",
  "cron": "^4.3.5",
  "load-esm": "^1.0.3"
}
```

- **uuid** `9.0.1`: UUIDv4 generation cho entity IDs
- **rxjs** `7.8.1`: Reactive programming (required by NestJS)
- **geojson** `0.5.0`: GeoJSON type definitions cho PostGIS queries
- **cron** `4.3.5`: Cron expression parsing (used by @nestjs/schedule)

### Dev Dependencies (Backend)

```json
"devDependencies": {
  "@nestjs/cli": "^11.0.0",
  "@nestjs/schematics": "^11.0.0",
  "@nestjs/testing": "^11.0.1",
  "jest": "^29.0.0",
  "ts-jest": "^29.2.5",
  "supertest": "^7.0.0",
  "typescript": "^5.7.3",
  "eslint": "^9.18.0",
  "prettier": "^3.4.2",
  "husky": "^9.1.7"
}
```

- **@nestjs/cli** `11.0.0`: CLI tool (`nest generate`, `nest build`)
- **jest** `29.0.0`: Testing framework (unit + integration tests)
- **supertest** `7.0.0`: HTTP assertion library cho e2e tests
- **typescript** `5.7.3`: TypeScript compiler (target: ES2022)
- **eslint** `9.18.0`: Linting with @typescript-eslint parser
- **prettier** `3.4.2`: Code formatting (80 char line width, single quotes)
- **husky** `9.1.7`: Git hooks (pre-commit linting)

**Type Definitions**:
```json
"@types/express": "^5.0.0",
"@types/bcrypt": "^6.0.0",
"@types/jest": "^29.0.0",
"@types/node": "^22.10.7",
"@types/passport-jwt": "^4.0.1",
"@types/passport-google-oauth20": "^2.0.17",
"@types/uuid": "^10.0.0",
"@types/geojson": "^7946.0.16",
"@types/multer": "^2.0.0"
```

---

## ⚛️ Frontend Dependencies

### Core Framework (React & Next.js)

```json
"dependencies": {
  "next": "16.0.3",
  "react": "19.2.0",
  "react-dom": "19.2.0"
}
```

- **next** `16.0.3`
  - **Mục đích**: React framework with SSR, App Router, API routes
  - **Lý do**: Production-grade React với SEO optimization, server components
  - **Key features**: Turbopack (dev mode), React 19 support, Partial Prerendering (preview)
  - **Breaking changes**: App Router default, Pages Router deprecated warning

- **react** `19.2.0`
  - **Mục đích**: UI library with declarative components
  - **Lý do**: Industry standard, large ecosystem, React Compiler support
  - **New in v19**: React Compiler (experimental), Server Actions, useOptimistic

- **react-dom** `19.2.0`
  - **Mục đích**: React renderer cho DOM
  - **Lý do**: Required by React for browser rendering
  - **Features**: Concurrent rendering, automatic batching

### UI Components & Styling

```json
"dependencies": {
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-slot": "^2.3",
  "@radix-ui/react-tabs": "^1.1.13",
  "lucide-react": "^0.554.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

- **@radix-ui/react-*** components
  - **Mục đích**: Unstyled, accessible UI primitives
  - **Lý do**: WAI-ARIA compliant, keyboard navigation, focus management
  - **Used in**: Form labels, dialog modals, tabs navigation

- **lucide-react** `0.554.0`
  - **Mục đích**: Icon library (600+ icons)
  - **Lý do**: Tree-shakeable, React 19 compatible, consistent design
  - **Example**: `<MapPin />`, `<CloudRain />`, `<AlertTriangle />`

- **class-variance-authority** `0.7.1`
  - **Mục đích**: CSS variant management
  - **Lý do**: Type-safe component variants (button sizes, colors)

- **clsx** `2.1.1`: Conditional className utility
- **tailwind-merge** `3.4.0`: Merge Tailwind classes without conflicts

### Mapping & Visualization

```json
"dependencies": {
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "react-leaflet-cluster": "^4.0.0",
  "leaflet-routing-machine": "^3.2.12",
  "@types/leaflet": "^1.9.21"
}
```

- **leaflet** `1.9.4`
  - **Mục đích**: Interactive map library (alternative to Google Maps)
  - **Lý do**: Open-source, lightweight (39KB gzipped), no API key required
  - **Tile provider**: OpenStreetMap (free, self-hosted option available)

- **react-leaflet** `5.0.0`
  - **Mục đích**: React components cho Leaflet
  - **Lý do**: Declarative API (<MapContainer>, <Marker>, <Popup>)
  - **React 19 compatibility**: v5.0.0 supports React 19

- **react-leaflet-cluster** `4.0.0`
  - **Mục đích**: Marker clustering để avoid marker overlap
  - **Lý do**: Performance optimization (1000+ markers → clusters)
  - **Used in**: Bus stops, parking lots, POIs

- **leaflet-routing-machine** `3.2.12`
  - **Mục đích**: Turn-by-turn routing on map
  - **Lý do**: Navigation features cho users
  - **Backend**: Uses OSRM (Open Source Routing Machine)

### Charts & Data Visualization

```json
"dependencies": {
  "recharts": "^3.5.1"
}
```

- **recharts** `3.5.1`
  - **Mục đích**: React charting library
  - **Lý do**: Composable charts (<LineChart>, <BarChart>, <AreaChart>)
  - **Used in**: History dashboard (temperature trends, AQI over time)
  - **Features**: Responsive, animated, tooltip support

### HTTP Client

```json
"dependencies": {
  "axios": "^1.13.2"
}
```

- **axios** `1.13.2`
  - **Mục đích**: HTTP client cho API calls từ frontend
  - **Lý do**: Same as backend (consistent error handling)
  - **Configured in**: `src/services/api.ts` (base URL, interceptors)

### Dev Dependencies (Frontend)

```json
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "tailwindcss": "^4",
  "tw-animate-css": "^1.4.0",
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "16.0.3",
  "babel-plugin-react-compiler": "1.0.0"
}
```

- **tailwindcss** `4.x`
  - **Mục đích**: Utility-first CSS framework
  - **Lý do**: Rapid UI development, small bundle (with JIT mode)
  - **Config**: `tailwind.config.ts` (custom colors, spacing)

- **@tailwindcss/postcss** `4.x`
  - **Mục đích**: PostCSS plugin cho Tailwind v4
  - **Lý do**: Required for Tailwind CSS processing

- **tw-animate-css** `1.4.0`
  - **Mục đích**: Animation classes cho Tailwind
  - **Lý do**: Smooth transitions (fade-in, slide-up)

- **babel-plugin-react-compiler** `1.0.0`
  - **Mục đích**: React Compiler (experimental)
  - **Lý do**: Automatic memoization, better performance
  - **Status**: Preview feature in React 19

**Type Definitions**:
```json
"@types/leaflet": "^1.9.21",
"@types/node": "^20",
"@types/react": "^19.2.6",
"@types/react-dom": "^19.2.0"
```

---

## 🔗 Shared Dependencies

```json
{
  "name": "@x-smart/shared",
  "version": "1.0.0",
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Mục đích**: Shared TypeScript types/interfaces giữa Backend và Frontend

**Trạng thái hiện tại**: Placeholder (chưa có code chia sẻ)

## 🐳 Infrastructure & Docker Stack

### Docker Compose Services

```yaml
services:
  postgres:      # postgis/postgis:16-3.4
  kafka:         # confluentinc/cp-kafka:7.5.0
  scorpio:       # scorpiobroker/all-in-one-runner:java-kafka-latest
  minio:         # minio/minio:latest
  createbuckets: # minio/mc (init container)
  backend:       # Node.js 20 + NestJS (local build)
  frontend:      # Node.js 20 + Next.js (local build)
```

| Service          | Image                                                      | Port(s)      | Volume(s)              | Mục Đích                                                |
| ---------------- | ---------------------------------------------------------- | ------------ | ---------------------- | ------------------------------------------------------- |
| **postgres**     | `postgis/postgis:16-3.4`                                   | 5432         | `postgres_data`        | PostgreSQL database với PostGIS extension               |
| **kafka**        | `confluentinc/cp-kafka:7.5.0`                              | 9092, 9093   | `kafka_data`           | Kafka broker (KRaft mode, no ZooKeeper)                 |
| **scorpio**      | `scorpiobroker/all-in-one-runner:java-kafka-latest`        | 9090         | -                      | NGSI-LD context broker cho smart city entities          |
| **minio**        | `minio/minio:latest`                                       | 9000, 9001   | `./minio_data`         | S3-compatible object storage (9001 = Console UI)        |
| **createbuckets**| `minio/mc`                                                 | -            | -                      | MinIO init container (tạo bucket `x-smart-reports`)     |
| **backend**      | `node:20-alpine` (via Dockerfile)                          | 3000         | `./backend:/app`       | NestJS API server (hot reload trong dev mode)           |
| **frontend**     | `node:20-alpine` (via Dockerfile)                          | 5173         | `./frontend:/app`      | Next.js UI (Vite dev server trong dev mode)             |

### PostGIS Extensions

PostgreSQL image `postgis/postgis:16-3.4` includes:
- **PostGIS 3.4**: Spatial database extension (geometry, geography types)
- **GEOS**: Geometry operations (ST_Distance, ST_Contains, ST_Within)
- **PROJ**: Coordinate system transformations (SRID 4326 = WGS84)

### Kafka Topics

| Topic                        | Partitions | Replication | Mục Đích                                     |
| ---------------------------- | ---------- | ----------- | -------------------------------------------- |
| `weather-updates`            | 3          | 1           | Weather data ingestion events                |
| `air-quality-updates`        | 3          | 1           | Air quality data ingestion events            |
| `report-notifications`       | 1          | 1           | Citizen report status changes → NotificationsModule |

### MinIO Buckets

| Bucket Name          | Policy       | Mục Đích                                    |
| -------------------- | ------------ | ------------------------------------------- |
| `x-smart-reports`    | download     | Citizen report attachments (images, PDFs)   |

---

## 📜 Standards & Specifications

### NGSI-LD (ETSI GS CIM 009)

- **Version**: 1.8.1
- **Specification**: [ETSI GS CIM 009](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim_009v010801p.pdf)
- **Mục đích**: Standardized API cho context information management
- **Features**:
  - JSON-LD format với `@context`
  - Entity model: id, type, properties (value + observedAt + unitCode)
  - Geospatial queries: `georel=near;maxDistance==5000`
  - Temporal representation: `observedAt` timestamps
- **Implementation**: Scorpio Broker implements full NGSI-LD CRUD operations

### SOSA/SSN (W3C Semantic Sensor Network)

- **Specification**: [W3C SOSA/SSN](https://www.w3.org/TR/vocab-ssn/)
- **Mục đích**: Ontology cho sensors, observations, actuators
- **Used in**: Modeling weather stations, air quality sensors
- **Key classes**:
  - `sosa:Sensor`: Device that observes (e.g., temperature sensor)
  - `sosa:Observation`: Act of measuring (temperature reading at time T)
  - `sosa:ObservableProperty`: Property being measured (temperature)
  - `sosa:FeatureOfInterest`: Entity being observed (location)

### FiWARE Smart Data Models

- **Repository**: [smartdatamodels.org](https://smartdatamodels.org/)
- **Mục đích**: Harmonized data models cho smart cities
- **Used models**:
  - `WeatherObserved`: Temperature, humidity, pressure, windSpeed
  - `AirQualityObserved`: CO, NO2, O3, PM10, PM2.5, SO2
  - `ParkingSpot`: availableSpotNumber, location
  - `PointOfInterest`: category, name, address, location
  - `PublicTransportStop`: refLine, location

---

## 📦 Dependency Management

### Phiên Bản Node.js & NPM

```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

- **Node.js**: >= 20.0.0 (khuyến nghị 22.x LTS)
  - **Lý do**: NestJS 11 requires Node.js 20+
  - **Check version**: `node -v`
  - **Download**: [nodejs.org](https://nodejs.org/)

- **NPM**: >= 10.0.0
  - **Check version**: `npm -v`
  - **Update**: `npm install -g npm@latest`

### Quy Trình Cập Nhật

#### 1. Kiểm tra Phiên Bản Mới

```bash
cd backend
npm outdated

# Output example:
# Package         Current  Wanted  Latest
# @nestjs/common  11.0.1   11.0.2  11.0.2
# axios           1.13.2   1.13.3  1.14.0
```

#### 2. Cập Nhật Một Package

```bash
# Update to "Wanted" version (respects semver range in package.json)
npm update axios

# Update to "Latest" version (may break semver range)
npm install axios@latest

# Update to specific version
npm install axios@1.14.0
```

#### 3. Cập Nhật Tất Cả Dependencies

```bash
# Update all packages to "Wanted" versions
npm update

# Update all to "Latest" (use with caution!)
npx npm-check-updates -u  # Updates package.json
npm install               # Installs updated versions
```

#### 4. Testing Sau Khi Cập Nhật

```bash
# Backend tests
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run lint         # Linting check
npm run build        # Compilation check

# Frontend tests
npm run build        # Production build test
npm run lint         # ESLint check
```

---

## 🔒 Bảo Mật & Lỗ Hổng Bảo Mật

### Kiểm Tra Lỗ Hổng Bảo Mật

```bash
# Scan dependencies for known vulnerabilities
npm audit

# Output example:
# found 3 vulnerabilities (1 moderate, 2 high)
# run `npm audit fix` to fix them
```

### Sửa Lỗi Tự Động

```bash
# Sửa lỗ hổng tự động (có thể cập nhật phiên bản package)
npm audit fix

# Sửa lỗi bắt buộc (có thể cài đặt các thay đổi gây lỗi tương thích)
npm audit fix --force
```

### Xem Xét Thủ Công

```bash
# Xem báo cáo lỗ hổng chi tiết
npm audit --json > audit-report.json

# Kiểm tra package cụ thể
npm view axios versions   # Liệt kê tất cả phiên bản có sẵn
npm view axios security   # Xem cảnh báo bảo mật
```

## 📄 License Information

### Project License

**X-Smart Platform**: MIT License

**Implications**:
- Commercial use allowed
- Modification allowed
- Distribution allowed
- Private use allowed
- No liability or warranty


## 🌳 Dependency Tree

### Backend Core Dependencies

```
backend
├── @nestjs/common@11.0.1
│   ├── rxjs@7.8.1
│   └── reflect-metadata@0.2.2
├── @nestjs/typeorm@11.0.0
│   └── typeorm@0.3.27
│       └── pg@8.16.3
├── @nestjs/passport@11.0.5
│   ├── passport@0.7.0
│   ├── passport-jwt@4.0.1
│   └── passport-google-oauth20@2.0.0
└── @nestjs/microservices@11.1.9
    └── kafkajs@2.2.4
```

### Frontend Core Dependencies

```
frontend
├── next@16.0.3
│   ├── react@19.2.0
│   └── react-dom@19.2.0
├── react-leaflet@5.0.0
│   └── leaflet@1.9.4
└── recharts@3.5.1
```

### Peer Dependencies

**Peer dependencies** là dependencies mà package yêu cầu nhưng KHÔNG tự động cài đặt.

**Backend**:
```json
// @nestjs/common requires:
"peerDependencies": {
  "reflect-metadata": "^0.2.0",
  "rxjs": "^7.0.0"
}

// typeorm requires:
"peerDependencies": {
  "pg": "^8.0.0"  // If using PostgreSQL
}
```

**Frontend**:
```json
// react-leaflet requires:
"peerDependencies": {
  "leaflet": "^1.9.0",
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

**Check missing peer dependencies**:
```bash
npm ls  # Lists dependency tree + warnings for missing peers
```

---

## ⚙️ Available Scripts

### Backend Scripts

```bash
npm run build        # Biên dịch TypeScript → dist/ folder
npm run format       # Định dạng code với Prettier
npm start            # Chạy compiled code (production mode)
npm run start:dev    # Chế độ phát triển với hot reload (watch mode)
npm run start:debug  # Debug mode với Inspector protocol
npm run start:prod   # Chạy production build (node dist/main.js)
npm run lint         # Kiểm tra code style với ESLint
npm test             # Chạy unit tests với Jest
npm run test:watch   # Jest watch mode (re-run on file changes)
npm run test:cov     # Test coverage report (HTML report in coverage/)
npm run test:debug   # Debug tests với Node.js Inspector
npm run test:e2e     # End-to-end tests với Supertest
```

### Frontend Scripts

```bash
npm run dev          # Chế độ phát triển (Next.js dev server on port 5173)
npm run build        # Biên dịch ứng dụng cho production (.next/ folder)
npm start            # Chạy production build (requires `npm run build` first)
npm run lint         # Kiểm tra code style với ESLint + next lint rules
```

### Shared Scripts

```bash
npm run build        # Compile TypeScript types to dist/
```

### Root Scripts (Monorepo)

```bash
# Install all dependencies for backend + frontend + shared
npm install --workspaces

# Run backend tests
npm run test --workspace=backend

# Build all workspaces
npm run build --workspaces
```

---
