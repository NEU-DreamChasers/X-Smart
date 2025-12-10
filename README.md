# 🌍 X-Smart — Nền tảng dữ liệu mở cho đô thị thông minh

<p align="center">
   <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
   <img src="https://img.shields.io/badge/version-1.0.0-orange" alt="Version" />
   <img src="https://img.shields.io/badge/node-18+-brightgreen" alt="Node.js" />
   <img src="https://img.shields.io/badge/docker-20.10%2B-blue" alt="Docker" />
   <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript" />
   <img src="https://img.shields.io/badge/Fiware-Scorpio%20LD-0A9EDC" alt="Fiware Scorpio-LD" />
   <img src="https://img.shields.io/badge/NGSI--LD-Smart%20Data%20Models-0A9EDC" alt="NGSI-LD Smart Data Models" />
</p>

<p align="center" style="margin-top: 6px;">
   <a href="http://101.96.66.225:8000/api" style="margin-right:8px;">
      <img src="https://img.shields.io/badge/API-Swagger%20Docs-6C63FF?logo=swagger&logoColor=white&labelColor=4b4b7f&style=for-the-badge" alt="Swagger Docs" height="32" />
   </a>
   <a href="http://101.96.66.225:8000">
      <img src="https://img.shields.io/badge/Web-Demo-22c55e?logo=vercel&logoColor=white&labelColor=166534&style=for-the-badge" alt="Web Demo" height="32" />
   </a>
</p>

---

## 📑 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc Hệ thống](#️-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Yêu cầu Hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn Cài đặt Nhanh](#-hướng-dẫn-cài-đặt-nhanh)
- [Tài liệu](#-tài-liệu)
- [Đóng góp](#-đóng-góp)
- [Liên hệ](#-liên-hệ)
- [Quy tắc Ứng xử](#-quy-tắc-ứng-xử)
- [Báo cáo Lỗi & Góp ý](#-báo-cáo-lỗi--góp-ý)
- [Giấy phép](#-giấy-phép)

---

## 📌 Giới Thiệu

**X-Smart** là một nền tảng mã nguồn mở xây dựng cho các thành phố thông minh. Dự án cung cấp giải pháp quản lý, trực quan hoá và phân tích dữ liệu đô thị theo các tiêu chuẩn mở như **NGSI-LD (ETSI)**, **SOSA/SSN (W3C)** và **FiWARE Smart Data Models**.

Dự án tập trung vào xây dựng một nền tảng toàn diện, kết hợp dữ liệu mở liên kết phục vụ chuyển đổi số, hướng tới các mục tiêu:

- Cung cấp cho người dân **nền tảng tra cứu** hữu ích, dễ sử dụng
- Cho phép **các nhà quản lý** quản lý dữ liệu thu thập qua cảm biến, **gửi cảnh báo** và **xử lý phản ánh** của người dân
- Cho phép **người dân** nhận thông báo, **gửi báo cáo sự cố** về các vấn đề trong thành phố

> Xây dựng bởi **NEU-DreamChasers** cho cuộc thi Olympic Tin học Sinh viên - Mã nguồn mở năm 2025

---

## 🎯 Tính Năng

### 👤 Người Dùng

- **Xem bản đồ tương tác** — Hiển thị vị trí các cảm biến, tìm kiếm địa điểm
- **Kiểm tra thời tiết & AQI** — Xem nhiệt độ, độ ẩm, chất lượng không khí real-time
- **Tìm bãi đỗ xe** — Xem số chỗ trống, vị trí bãi đỗ gần nhất
- **Tra cứu xe bus** — Xem vị trí xe
- **Báo cáo sự cố** — Gửi báo cáo về tình trạng đô thị (môi trường, giao thông, cơ sở hạ tầng, v.v)
- **Tìm kiếm & Lọc** — Tìm cảm biến, điểm quan tâm theo vị trí, loại

### 👨‍💼 Admin / Quản Trị Viên

- **Dashboard thống kê** — Xem tổng quan entity, cảm biến, báo cáo hệ thống
- **Biểu đồ phân tích** — Trực quan hoá dữ liệu nhiệt độ, AQI, lượng mưa
- **Quản lý bản đồ** — Thêm/sửa/xoá marker, điều chỉnh layer hiển thị
- **Quản lý dữ liệu** — Xem dữ liệu tất cả entity (thời tiết, không khí, bãi đỗ, xe bus)
- **Quản lý báo cáo** — Xem, duyệt, từ chối báo cáo từ công dân
- **Thông báo & Cảnh báo** — Theo dõi bất thường, gửi cảnh báo tới người dân
- **Lưu trữ báo cáo** — Lưu file PDF, hình ảnh trong MinIO storage

---

## 🏗️ Kiến Trúc Hệ Thống

### Sơ đồ kiến trúc

```
┌──────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL DATA SOURCES                         │
│  (OpenWeatherMap, OpenAQ, OSM, GTFS, User Submissions)               │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   INGESTION SERVICE (NestJS)                         │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Data Adapters: Weather | Air | Bus | Parking               │     │
│  │  - Normalization → NGSI-LD format                           │     │
│  │  - Kafka Event Publishing                                   │     │
│  │  - History Recording                                        │     │
│  └─────────────────────────────────────────────────────────────┘     │
└────┬────────────────────────────────┬─────────────────────────┬──────┘
     │                                │                         │
     ▼                                ▼                         ▼
┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│  Scorpio Broker    │  │  PostgreSQL        │  │  Kafka Message Bus   │
│  (NGSI-LD)         │  │  (History + GIS)   │  │  (Events)            │
│  Port: 9090        │  │  Port: 5432        │  │  Port: 9092          │
└────────┬───────────┘  └────────────────────┘  └──────────────────────┘
         │
         │ ┌────────────────────────────────────┐
         │ │  Backend API (NestJS)              │
         │ │  REST Endpoints                    │
         │ │  Port: 8080                        │
         │ └────────────────────┬───────────────┘
         │                      │
         └──────────────────────┼──────────────────┐
                                │                  │
                                ▼                  ▼
                        ┌──────────────────┐  ┌────────────────┐
                        │  Frontend (Next) │  │  MinIO Storage │
                        │  Dashboard       │  │  Port: 9001    │
                        │  Port: 3000      │  │  (S3-like)     │
                        └──────────────────┘  └────────────────┘
```



---

## 🛠️ Tech Stack

**Công nghệ sử dụng chính:**

- **Backend Framework**: NestJS (TypeScript)
- **Frontend Framework**: Next.js (React 19, TypeScript), Tailwind CSS
- **Python (flood analysis service)**: Python 3.10+
- **Database**: PostgreSQL 16 + PostGIS
- **NGSI-LD Broker**: Scorpio
- **Message Queue**: Kafka (KRaft mode)
- **Object Storage**: MinIO (S3-compatible)
- **Data Sources**: OpenWeatherMap API, OpenStreetMap API 
- **Containerization**: Docker & Docker Compose
- **Standards**: NGSI-LD (ETSI), SOSA/SSN (W3C), FiWARE Smart Data Models

---

## 📦 Yêu Cầu Hệ Thống

### Bắt buộc

| Thành phần | Phiên bản | Ghi chú |
|-----------|----------|--------|
| **Docker** | 20.10+ | Desktop hoặc Server |
| **Docker Compose** | 2.0+ | Bao gồm trong Docker Desktop |
| **Git** | 2.25+ | Version control |

### Đề xuất

- **RAM**: 4GB tối thiểu, 8GB khuyến nghị
- **Storage**: 5GB cho images, 2GB cho volumes
- **OS**: Linux, macOS, hoặc Windows 10+ (với WSL2)

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh

### Bước 1: Clone Repository

```bash
git clone https://github.com/NEU-DreamChasers/X-Smart.git
cd X-Smart
```

### Bước 2: Cấu hình Biến Môi trường

```bash
# Sao chép file mẫu
cp .env.example .env

# Chỉnh sửa các biến quan trọng:
# - OPENWEATHER_API_KEY
# - DATABASE_PASSWORD
# - JWT_SECRET
# - Tạo Service Account Key trên Google Cloud Console (nếu dùng Google APIs):
# - Vào Google Cloud Console → IAM & Admin → Service Accounts → Create Service Account.
# - Tạo key (JSON) và tải về file: service-account.json
```

### Bước 3: Khởi động Services

```bash
# Build và khởi động tất cả services
docker-compose up -d --build

# Hoặc chỉ up (nếu đã build)
docker-compose up -d
```

### Bước 4: Truy cập các dịch vụ

| Ứng dụng | URL | Thông tin đăng nhập |
|---------|-----|-------------------|
| **Frontend Dashboard** | http://localhost:3000 | User & Admin Dashboard |
| **Backend Swagger API** | http://localhost:8080/api/docs | REST API & Swagger Docs |
| **Scorpio Broker** | http://localhost:9090 | Context Broker |
| **MinIO Console** | http://localhost:9001 | Object Storage UI |

### Dừng Stack

```bash
# Dừng tất cả services
docker-compose down

# Dừng + xóa volumes (data sẽ bị mất)
docker-compose down -v
```

---

## 📚 Tài Liệu

| Tài liệu | Nội dung |
|---------|---------|
| **[SETUP.md](./docs/SETUP.md)** | Hướng dẫn cài đặt chi tiết, troubleshooting, cấu hình nâng cao |
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Kiến trúc hệ thống, component diagram, data flow, design patterns |
| **[API.md](./docs/API.md)** | Tài liệu REST API chi tiết, endpoint, request/response examples |
| **[DEPENDENCIES.md](./docs/DEPENDENCIES.md)** | Danh sách packages, phiên bản, lý do lựa chọn, alternatives |
| **[TECH_STACK.md](./docs/TECH_STACK.md)** | Chi tiết công nghệ sử dụng, so sánh, lợi ích |
| **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** | Hướng dẫn đóng góp, workflow, coding standards |
| **[CODE_OF_CONDUCT.md](./docs/CODE_OF_CONDUCT.md)** | Quy tắc ứng xử cộng đồng, công bằng, tôn trọng |

Để xem đầy đủ, truy cập thư mục [/docs](./docs/).

---

## 🤝 Đóng Góp Cho Dự Án

### Quy trình đóng góp

1. **Fork** repository
2. **Tạo feature branch** từ `main`:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
3. **Commit changes** với message rõ ràng:
   ```bash
   git commit -m "Add: new feature description"
   ```
4. **Push** đến branch:
   ```bash
   git push origin feature/my-awesome-feature
   ```
5. **Mở Pull Request** với:
   - Tiêu đề rõ ràng
   - Mô tả chi tiết thay đổi
   - Reference issue nếu có (#123)

Chi tiết xem tại: [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📞 Liên Hệ

### Thông tin liên lạc

- **GitHub**: [NEU-DreamChasers](https://github.com/NEU-DreamChasers)

---

## 📜 Changelog

Xem [CHANGELOG.md](./CHANGELOG.md) để biết lịch sử thay đổi

## 📋 Quy Tắc Ứng Xử

Dự án này tuân theo bộ quy tắc ứng xử cho cộng đồng. Xem file [CODE_OF_CONDUCT.md](./docs/CODE_OF_CONDUCT.md) để biết thêm chi tiết về các quy tắc và hành vi được chấp nhận.

---

## 🐛 Báo Cáo Lỗi & Góp Ý

Báo cáo lỗi và đề xuất tính năng mới tại [GitHub Issues](https://github.com/NEU-DreamChasers/X-Smart/issues)



---

## 📄 Giấy Phép

Dự án này được phát hành dưới **[MIT License](./LICENSE)**.

Xem file [LICENSE](./LICENSE) để biết thêm chi tiết

---

<div align="center">

© 2025 **X-Smart** — *Dữ liệu mở cho thành phố thông minh*

🌍 **Building smarter cities, one data point at a time** 🌍

</div>


