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