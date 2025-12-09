# 🚀 Hướng Dẫn Cài Đặt & Chạy X-Smart

---

## 💻 Yêu Cầu Hệ Thống

**Phần Mềm Cần Thiết:**
- Docker Desktop >= 27.0.0 ([Download](https://www.docker.com/products/docker-desktop/))
- Git >= 2.30.0 ([Download](https://git-scm.com/downloads))


**Kiểm tra:**
```bash
docker --version
docker-compose --version
git --version
```

---

## 🚀 Các Bước Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/NEU-DreamChasers/X-Smart.git
cd X-Smart
```

### 2. Tạo File Cấu Hình (Nhanh)

**Chạy script tự động (khuyến nghị):**

```powershell
# Windows (PowerShell)
.\scripts\setup.bat
```

```bash
# macOS / Linux
./scripts/setup.sh
```

Script sẽ tự động:
- Cài đặt dependencies (npm install)
- Copy `.env.example` → `.env` cho root, backend, frontend
- Build và khởi động docker-compose

**Hoặc thủ công nếu không muốn chạy script:**

Hoặc thủ công bằng lệnh copy:

```bash
# macOS / Linux
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Windows PowerShell
Copy-Item .env.example .env -Force
Copy-Item backend/.env.example backend/.env -Force
Copy-Item frontend/.env.example frontend/.env -Force
```

Sau đó mở các file `.env` để chỉnh các biến nhạy cảm cho phù hợp môi trường.

- `JWT_SECRET` (bắt buộc đổi cho production)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, 'GOOGLE_CALLBACK_URL (dùng cho OAuth)
- `OPENWEATHER_API_KEY`, (Dùng cho dữ liệu thời tiết)

**Lưu Ý**
- Google Client Keys: tạo trong [Google Cloud Console](https://console.cloud.google.com).
- Weather/Air quality keys: đăng ký tại [OpenWeatherMap](openweathermap.org)


### 3. Khởi Động Services

```bash
# Pull images
docker-compose pull

# Khởi động
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 4. Kiểm Tra

```bash
# Kiểm tra containers
docker-compose ps

# Kiểm tra health
curl http://localhost:8080/api/health
curl http://localhost:9090/ngsi-ld/v1/info
curl -I http://localhost:3000
curl -I http://localhost:9001
```

---

## 🌐 Truy Cập Ứng Dụng

| Service | URL | Mô Tả |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Giao diện người dùng chính |
| **Backend API (Swagger)** | http://localhost:8080/api/docs#/ | API Documentation & Testing |
| **Scorpio Context Broker** | http://localhost:9090/ngsi-ld/v1 | NGSI-LD API endpoints |
| **MinIO Console** | http://localhost:9001 | Object Storage (minioadmin / minioadminpassword) |
| **PostgreSQL** | http://localhost:5432 | Database (ngb / ngb) |

---

## 🔧 Quản Lý Cơ Bản

### Các Lệnh Thường Dùng

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose stop

# Restart
docker-compose restart [service-name]

# Xem logs
docker-compose logs -f [service-name]

# Dừng và xóa containers
docker-compose down

# Reset hoàn toàn (xóa cả data)
docker-compose down -v
```

## 🆘 Hỗ Trợ

- Tạo [GitHub Issues](https://github.com/NEU-DreamChasers/X-Smart/issues) nếu cần hỗ trợ  
- Liên hệ [NEU-DreamChasers](https://github.com/NEU-DreamChasers) để nhận được phản hồi sớm nhất
