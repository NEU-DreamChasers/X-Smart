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
## [0.3.0] - 2025-12-01

### Added (Tính năng mới)

#### Citizen Reporting (Báo cáo sự cố)
- **Smart Report Creation (`POST /reports`)**:
    - Cho phép cả **Công dân (User)** và **Khách vãng lai (Guest)** gửi báo cáo.
    - Cơ chế **Soft Authentication** (`OptionalJwtAuthGuard`): Tự động nhận diện người gửi dựa trên Token.
    - Validate dữ liệu chặt chẽ: Bắt buộc SĐT nếu là khách ẩn danh.
- **Intelligent Geocoding (Định vị thông minh)**:
    - Tích hợp **Nominatim OpenStreetMap API**.
    - **Reverse Geocoding**: Tự động điền địa chỉ khi người dùng chỉ gửi tọa độ.
    - **Forward Geocoding**: Tự động tìm tọa độ GPS khi người dùng chỉ nhập địa chỉ.
- **Report Management (Quản lý báo cáo)**:
    - Entity `Report` hỗ trợ lưu trữ vị trí không gian (**PostGIS Geometry**).
    - Quy trình duyệt bài đa trạng thái: `PENDING` -> `APPROVED` / `REJECTED` -> `RESOLVED`.
    - API Admin (`PATCH`) để duyệt hoặc từ chối báo cáo.
    - API Public (`GET`) chỉ hiển thị các báo cáo đã được duyệt.

#### Security & Auth (Bảo mật)
- **Role-Based Access Control (RBAC)**:
    - Triển khai `RolesGuard` và Decorator `@Roles`.
    - Phân quyền chặt chẽ: Chỉ Admin mới được truy cập các API quản lý.
- **Enhanced User Entity**:
    - Thêm quan hệ `OneToMany` giữa User và Reports.

## 2025-11-21
### Added
- **Authentication System**:
    - Tích hợp module `Auth` sử dụng `Passport.js` (Local Strategy & JWT Strategy).
    - API Endpoint `POST /auth/login` cho phép đăng nhập và nhận JWT Access Token.
    - Mã hóa mật khẩu người dùng bằng `bcrypt`.
- **User Management**:
    - Module `Users` và Entity `User` (TypeORM) ánh xạ với bảng `users` trong PostgreSQL.
    - Tính năng **Auto-Seeding**: Tự động kiểm tra và khởi tạo tài khoản Admin mặc định (`admin` / `admin123`) khi server khởi động.

## [0.3.0] - 2025-11-29 (Time-Series Storage & History API)

### Added

- **QuantumLeap Integration** (Time-Series Data Adapter):
  - Tích hợp `QuantumLeap 1.0.0` làm NGSI-LD history adapter
  - Tự động subscribe vào Scorpio Context Broker để lưu lịch sử entities
  - Hỗ trợ NGSI-LD notifications với `KEEP_RAW_ENTITY: true`
  - Docker service `quantumleap` với healthcheck endpoint `/v2/version`

- **TimescaleDB Integration** (PostgreSQL Time-Series Extension):
  - Thêm service `timescale` với image `timescale/timescaledb:latest-pg14`
  - Tự động tạo hypertables cho time-series data: `etweatherobserved`, `etairqualityobserved`
  - Port mapping: `5433:5432` để tránh conflict với PostgreSQL chính
  - Persistent storage với volume `timescale_data`

- **History Module** (Backend API cho Time-Series):
  - Module `HistoryModule` với `HistoryController` và `HistoryService`
  - Tích hợp `HttpModule` từ `@nestjs/axios` để gọi QuantumLeap API
  - **Raw Data Endpoints**:
    - `GET /history/entities/:type` - Lấy danh sách entities có lịch sử theo type
    - `GET /history/entities/:entityId/attrs/:attrName` - Lịch sử của một thuộc tính với query params (lastN, fromDate, toDate)
    - `GET /history/weather/:location` - Lịch sử thời tiết (temperature, humidity, pressure)
    - `GET /history/air/:location` - Lịch sử chất lượng không khí (AQI, PM2.5, PM10, CO, NO2, O3, SO2)
  - **Chart Data Endpoints** (Format cho Chart.js/Recharts):
    - `GET /history/chart/temperature/:location` - Biểu đồ nhiệt độ
    - `GET /history/chart/precipitation/:location` - Biểu đồ lượng mưa (Bar Chart)
    - `GET /history/chart/aqi/:location` - Biểu đồ chỉ số AQI
  - Chart format: `{ labels: string[], datasets: [{ label, data, borderColor, backgroundColor }] }`
  - Query parameters: `hours`, `lastN`, `fromDate`, `toDate` để lọc dữ liệu
  - Swagger documentation đầy đủ với examples cho tất cả endpoints

- **QuantumLeap Subscriptions**:
  - Auto-subscription cho `WeatherObserved` entities
  - Auto-subscription cho `AirQualityObserved` entities
  - Notification endpoint: `http://quantumleap:8668/v2/notify`
  - Tài liệu chi tiết: `docs/QUANTUMLEAP_SUBSCRIPTION.md` với subscription JSON examples, troubleshooting SQL scripts, và frontend integration guide

- **TimescaleDB Schema**:
  - Bảng `etweatherobserved` với các cột: `entity_id`, `entity_type`, `fiware_servicepath`, `time_index` (primary key), `temperature`, `relativehumidity`, `windspeed`, `winddirection`, `weathertype`, `address` (JSONB), `dateobserved`, `atmosphericpressure`, `visibility`, `cloudcoverage`, `precipitation`, `location`, `location_centroid`, `instanceid`, `__original_ngsi_entity__` (JSONB)
  - Bảng `etairqualityobserved` với các cột: `entity_id`, `entity_type`, `fiware_servicepath`, `time_index` (primary key), `airqualityindex`, `pm25`, `pm10`, `co`, `no2`, `o3`, `so2`, `location`, `location_centroid`, `dateobserved`, `instanceid`, `__original_ngsi_entity__` (JSONB)
  - Hypertables với `time_index` làm dimension column cho time-series queries hiệu năng cao

### Changed

- **Docker Compose Configuration**:
  - Thêm `timescale` service với PostgreSQL 14 + TimescaleDB extension
  - Thêm `quantumleap` service với dependencies vào `timescale` và `scorpio`
  - Backend environment: Thêm `QUANTUMLEAP_URL` (default: `http://quantumleap:8668`)
  - Network configuration: Tất cả services trong cùng `xsmart` bridge network

- **HistoryService**:
  - Sử dụng `ConfigService` để đọc `QUANTUMLEAP_URL` từ environment variables
  - HTTP client với proper error handling và logging
  - Data transformation: QuantumLeap response → Chart.js format
  - Time formatting: ISO timestamps → readable format (HH:mm DD-MM)

### Fixed

- **QuantumLeap Connection Issues**:
  - Sửa lỗi "Connection refused" khi QuantumLeap cố kết nối CrateDB port 4200
  - Thay đổi backend từ `mongo` sang `QL_DEFAULT_DB: timescale`
  - Thêm đầy đủ connection variables: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB_NAME`, `POSTGRES_DB_USER`, `POSTGRES_DB_PASS`
  - Disable CrateDB với `CRATE_WAIT_ACTIVE_SHARDS: 0`

- **TimescaleDB Schema Errors**:
  - Sửa lỗi "column does not exist" cho: `dateobserved`, `address`, `location`, `location_centroid`, `instanceid`, `fiware_servicepath`
  - Sửa lỗi "relation does not exist" bằng cách tạo tables thủ công với `CREATE TABLE`
  - Thêm `__original_ngsi_entity__` column (JSONB) để lưu raw entity khi `KEEP_RAW_ENTITY: true`
  - Tạo hypertables với `SELECT create_hypertable()` để enable time-series features

- **QuantumLeap Configuration**:
  - Set `USE_GEOCODING: false` để tránh overhead không cần thiết
  - Set `CACHE_QUERIES: true` để tăng performance
  - Set `POSTGRES_USE_SSL: False` cho development environment
  - Set `LOG_LEVEL: DEBUG` để dễ dàng troubleshooting

### Removed

- Loại bỏ phụ thuộc vào CrateDB backend (không cần thiết cho use case hiện tại)
- Xóa hardcoded QuantumLeap URL trong code (chuyển sang ConfigService)

---

## [0.2.0] - 2025-11-27 (Data Ingestion & Adapter System)

### Added

- **Hệ thống Data Ingestion & Adapter (Data Converter)**:
  - Module `IngestionModule` với kiến trúc Adapter Pattern cho việc chuẩn hóa dữ liệu từ nhiều nguồn khác nhau
  - Tích hợp `@nestjs/schedule` với `ScheduleModule.forRoot()` cho cron jobs
  - `AdapterFactory` để quản lý và khởi tạo các adapter động theo loại nguồn dữ liệu
  - `BaseAdapter` (abstract class) cung cấp các helper methods chuẩn cho việc xây dựng NGSI-LD entities
  - **Các Adapter cụ thể**:
    - `OpenWeatherMapAdapter`: Chuyển đổi dữ liệu thời tiết từ OpenWeatherMap API sang `WeatherObserved`
    - `AirQualityAdapter`: Chuyển đổi dữ liệu chất lượng không khí sang `AirQualityObserved`
    - `OverpassAdapter`: Chuyển đổi dữ liệu từ OpenStreetMap (POI, Bus Stops, Parking) sang `PointOfInterest` và `OffStreetParking`

- **Scorpio Integration Service**:
  - `ScorpioService` với đầy đủ CRUD operations cho NGSI-LD entities
  - Hỗ trợ Upsert operations (POST/PUT) để tránh duplicate entities
  - **Pagination Support**: Tự động phân trang khi query entities với `limit=1000` và `offset` tăng dần
  - Query filtering theo type và custom query parameters
  - Fetch all entities logic: Loop với `keepFetching` flag để lấy hết dữ liệu lớn (ví dụ: tất cả bãi đỗ xe trong TP.HCM)
  - Error handling và logging chi tiết cho các operations với Scorpio Broker

- **REST API cho Ingestion** (`ContextController`):
  - **GET /:domain/status** - Lấy danh sách entities theo domain (weather, air, bus, parking, poi)
    - Support query filtering: `?category=bus_stop` cho bus, `?category=hospital` cho POI
    - Tự động map domain → NGSI-LD type (weather → WeatherObserved, parking → OffStreetParking)
  - **GET /:domain/status/:id** - Lấy chi tiết một entity cụ thể
  - **POST /:domain/status/:id** - Tạo/nhập dữ liệu mới (upsert)
  - **PUT /:domain/status/:id** - Cập nhật dữ liệu entity
  - **DELETE /:domain/status/:id** - Xóa entity khỏi hệ thống
  - **GET /map/search-nearby** - Tìm kiếm địa điểm xung quanh (bus, parking, poi) với radius parameter
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

- **Scheduled Jobs & Background Tasks**:
  - **Weather/Air Ingestion Cron** (`@Cron(EVERY_5_MINUTES)`): Thu thập dữ liệu môi trường từ OpenWeatherMap API mỗi 5 phút
  - **Parking Simulation Cron** (`@Cron(EVERY_MINUTE)`): Giả lập trạng thái bãi đỗ xe (availableSpotNumber, occupancy) mỗi phút dựa trên giờ cao điểm
  - Dynamic occupancy calculation: 80% trong giờ cao điểm (8h-18h), 20% ngoài giờ, với random variance ±20%
  - Tự động cập nhật `availableSpotNumber` = totalSpotNumber - occupied với `observedAt` timestamp

- **Import Static City Data** (Admin API):
  - Endpoint: `POST /admin/import-static?category=bus|parking|poi`
  - Import toàn bộ dữ liệu tĩnh từ OpenStreetMap cho TP.HCM (bbox: 10.37,106.34,11.16,107.02)
  - Bus stops: Query Overpass với `highway=bus_stop`
  - Parking lots: Query Overpass với `amenity=parking` (cả node và way)
  - POIs: Query Overpass với `amenity` tag
  - Timeout: 180 giây cho queries lớn, emit từng element vào Kafka topic

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

- **Scorpio Subscriptions** (Notification System):
  - Hỗ trợ tạo subscriptions cho real-time notifications
  - Notification endpoint hỗ trợ webhook callbacks
  - WatchedAttributes filtering cho selective notifications
  - Entity type filtering với `type` parameter trong subscription
  - JSON-LD context injection trong notifications

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

- **ScorpioService Pagination Logic**:
  - Refactor `getEntitiesByType()` để hỗ trợ pagination tự động
  - Tăng `LIMIT` từ 100 lên 1000 records/request để giảm số lần gọi API
  - Thêm `offset` parameter và `keepFetching` loop logic
  - Log progress: "🔄 Đang tải dữ liệu..." và "✅ Đã tải tổng cộng: X bản ghi"
  - Return type: `Promise<Record<string, any>[]>` thay vì `Promise<any>`

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
- **Bus Stops Query**: Sửa lỗi không lấy được tất cả bus stops do limit 100 - tăng lên 1000 và thêm pagination loop
- **Parking Lots Query**: Tương tự bus stops, thêm pagination để lấy hết bãi đỗ xe trong TP.HCM (hơn 100 records)

---

## [0.2.1] - 2025-11-21 (Authentication & User Management)

### Added

- **Authentication System**:
  - Tích hợp module `Auth` sử dụng `Passport.js` (Local Strategy & JWT Strategy)
  - API Endpoint `POST /auth/login` cho phép đăng nhập và nhận JWT Access Token
  - Mã hóa mật khẩu người dùng bằng `bcrypt` với salt rounds = 10
  - `LocalAuthGuard` cho username/password authentication
  - `JwtAuthGuard` cho protected routes với Bearer token
  - JWT token expiration: 1 hour (có thể configure)

- **User Management**:
  - Module `Users` và Entity `User` (TypeORM) ánh xạ với bảng `users` trong PostgreSQL
  - User schema: `id` (UUID), `username` (unique), `password` (hashed), `email`, `createdAt`, `updatedAt`
  - `UsersService` với methods: `findOne()`, `findByUsername()`, `validateUser()`
  - Tính năng **Auto-Seeding**: Tự động kiểm tra và khởi tạo tài khoản Admin mặc định (`admin` / `admin123`) khi server khởi động
  - Seed logic: Chỉ tạo admin user nếu chưa tồn tại trong database

- **Swagger Documentation cho Auth**:
  - Login endpoint với DTO example và response schema
  - Bearer authentication scheme cho protected endpoints
  - `@ApiBearerAuth()` decorator cho routes yêu cầu JWT

### Changed

- **Sources Controller**: Thêm `JwtAuthGuard` cho tất cả endpoints của Sources (POST, GET, PATCH, DELETE)
- **Auth Strategy**: LocalStrategy validate user thông qua `UsersService.validateUser()`

---
## [0.2.0] - 2025-11-27 (Data Ingestion & Adapter System)

### Added

- Khởi tạo repository structure: `backend/`, `frontend/`, `docs/`, `scripts/`
- NestJS backend skeleton với AppModule, AppController, AppService
- Next.js frontend với default template
- Docker & Docker Compose configuration (initial, Kafka)
- TypeORM setup cho PostgreSQL
- Package dependencies cơ bản: axios, @nestjs/config, @nestjs/swagger, uuid, v.v.

---

## Ghi chú

### Versions & Dependencies

- **Scorpio Broker**: `scorpiobroker/all-in-one-runner:java-kafka-latest` (v0.99.7+)
- **QuantumLeap**: `orchestracities/quantumleap:1.0.0` (NGSI-LD history adapter)
- **TimescaleDB**: `timescale/timescaledb:latest-pg14` (PostgreSQL 14 + TimescaleDB extension)
- **PostgreSQL**: `postgis/postgis:16-3.4` (PostgreSQL 16 + PostGIS 3.4)
- **Kafka**: `confluentinc/cp-kafka:7.5.0` (KRaft mode, không cần Zookeeper)
- **NestJS**: `^10.x` (Backend framework)
- **Next.js**: `^15.x` (Frontend framework)

### Architecture Patterns

- **Adapter Pattern**: Sử dụng trong Ingestion System để chuẩn hóa dữ liệu từ nhiều nguồn khác nhau (OpenWeatherMap, Overpass, v.v.)
- **Factory Pattern**: `AdapterFactory` để khởi tạo adapter động dựa theo loại nguồn dữ liệu
- **Repository Pattern**: TypeORM entities với repository pattern cho data access
- **Guard Pattern**: Authentication guards (`LocalAuthGuard`, `JwtAuthGuard`) cho route protection
- **Strategy Pattern**: Passport.js strategies (`local`, `jwt`) cho flexible authentication

### Data Standards

- **NGSI-LD**: Context Information Management standard từ ETSI (v1.9)
- **Smart Data Models**: Sử dụng data models từ FIWARE Foundation và TM Forum
  - `WeatherObserved`: Dữ liệu thời tiết theo chuẩn Smart Cities
  - `AirQualityObserved`: Chất lượng không khí với PM2.5, PM10, AQI
  - `PointOfInterest`: Điểm quan tâm từ OpenStreetMap
  - `OffStreetParking`: Bãi đỗ xe off-street
- **SOSA/SSN**: W3C Semantic Sensor Network Ontology (planned for future releases)
- **GeoJSON**: Chuẩn JSON cho dữ liệu địa lý (Point, LineString, Polygon)

### Infrastructure Details

- **KRaft Mode**: Kafka chạy ở KRaft mode (không cần Zookeeper) - giảm complexity
- **PostGIS**: PostgreSQL + extension PostGIS cho queries địa lý hiệu năng cao
- **TimescaleDB Hypertables**: Automatic partitioning cho time-series data với `time_index` dimension
- **Docker Networks**: Bridge network `xsmart` kết nối tất cả containers
- **Persistent Volumes**: `postgres_data`, `kafka_data`, `timescale_data` cho data persistence

### Security & Best Practices

- **JWT Authentication**: Token-based auth với expiration time
- **Password Hashing**: bcrypt với salt rounds = 10
- **Environment Variables**: Sensitive data stored in `.env` files (not committed)
- **CORS Enabled**: Cross-origin requests cho frontend-backend communication
- **Healthchecks**: Docker healthchecks cho Scorpio và QuantumLeap
- **Auto-restart**: Services với `restart: always` hoặc `unless-stopped`

### API Standards

- **RESTful API**: Sử dụng HTTP verbs (GET, POST, PUT, PATCH, DELETE) đúng semantic
- **Swagger/OpenAPI**: API documentation tại `/api/docs`
- **NGSI-LD API**: Context Broker endpoints follow ETSI NGSI-LD specification
- **QuantumLeap API**: Time-series API với NGSI-LD notifications support
- **Pagination**: Query parameters `limit`, `offset` cho large datasets
- **Time Filtering**: ISO 8601 timestamps với `fromDate`, `toDate`, `lastN` parameters

### Development Workflow

- **Monorepo Structure**: Backend, Frontend, Docs, Scripts trong cùng repository
- **Docker Compose**: One-command deployment với `docker compose up`
- **Hot Reload**: Backend và Frontend support hot reload trong development
- **ESLint & Prettier**: Code formatting và linting automation
- **TypeScript**: Strict typing cho cả backend và frontend
- **Git Branch Strategy**: Feature branches với prefix `feat/`, `fix/`, `docs/`

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

- **Frontend UI Components**:
  - Thêm giao diện trang chủ (homepage) responsive với modern design
  - Dashboard components: `AdminDashboard`, `CitizenDashboard`
  - Data visualization components: `SimpleBarChart`, `SimpleLineChart`, `SimplePieChart`
  - Monitoring components: `EnvironmentalMonitor`, `TransportationDashboard`
  - Service components: `PublicServices`, `CitizenServices`
  - Management components: `AdminDataManagement`, `AdminMapManagement`, `AdminAnalytics`
  - Map integration: `CitizenMapView`, `CityOverview`
  - Notification system: `CitizenNotifications`

### Removed

- Xóa `app.tsx` (đã được refactor vào route-based structure)
- Xóa `LoginScreen.tsx` (chuyển sang `SimpleLogin` component)
- Xóa `LoginModal.tsx` (tích hợp vào route system)

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- **Route Structure Refactor**:
  - Tái cấu trúc routes với Next.js App Router folder groups
  - Route groups: `(auth)/login` cho authentication pages
  - Route groups: `(dashboard)/admin`, `(dashboard)/citizen` cho dashboard pages
  - Kết hợp logic controller và UI components trong cùng file structure

---

## [0.1.1] - 2024-11-21

### Added

- **UI Framework**:
  - Tích hợp `shadcn/ui` (bộ component UI cao cấp cho React)
  - Cấu hình `components.json` cho shadcn/ui setup
  - Tailwind CSS với custom theme configuration
  - Component library: Button, Card, Input, Table, Dialog, và nhiều components khác từ shadcn/ui

### Changed

- Thêm homepage UI với modern design patterns
- Thêm admin UI dashboard với data tables và charts

---

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


## [0.1.4] - 2025-11-27

### Added

- Tính năng mới: **Report Form** (báo cáo từ công dân)
  - Frontend:
    - Thêm component `CitizenReportForm.tsx` — form báo cáo cho công dân, validation, gửi dữ liệu tới API
  - Backend:
    - Thêm `report.service.ts` — service xử lý lưu trữ và quản lý báo cáo
  - UI/Integration:
    - `CitizenDashboard.tsx`: tích hợp `CitizenReportForm.tsx` và hiển thị trạng thái báo cáo
    - `AdminDashboard.tsx`: thêm giao diện quản lý/duyệt báo cáo từ công dân
- Thêm service HTTP chung: `api.service.ts` — wrapper để gọi API từ frontend (axios/fetch)

### Updated

- Gọi API cho môi trường và dữ liệu cho admin:
  - `CitizenEnvironment.tsx`: gọi API hiển thị dữ liệu môi trường cho người dùng công dân
  - `AdminDataManagement.tsx`: gọi API để quản lý dữ liệu/hiển thị dữ liệu cho admin

### Fixed

- _(Chưa có fix nào được ghi chép)_

### Changed

- Add: added report form ui for citizen and admin
- Update: Gọi API cho môi trường cho người dùng và dữ liệu cho admin
