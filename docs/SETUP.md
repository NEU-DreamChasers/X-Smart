git clone https://github.com/NEU-DreamChasers/X-Smart.git
cd X-Smart

````
docker-compose up -d
docker-compose logs -f scorpio
docker-compose ps
docker-compose logs scorpio
docker-compose ps postgres
docker-compose restart postgres
docker-compose down -v
docker-compose up -d
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f scorpio
docker exec xsmart_postgres pg_dump -U ngb ngb > backup.sql
docker exec xsmart_postgres pg_dump -U ngb ngb | gzip > backup.sql.gz
docker exec -i xsmart_postgres psql -U ngb ngb < backup.sql
gunzip < backup.sql.gz | docker exec -i xsmart_postgres psql -U ngb ngb
# Hướng dẫn Thiết lập & Triển khai X-Smart

Tài liệu này mô tả cách thiết lập và chạy X-Smart cùng Scorpio Context Broker cho mục đích demo và phát triển.

---

## Yêu cầu trước khi bắt đầu

- **Docker & Docker Compose** (phiên bản gần đây, ví dụ v20.10+)
- **Node.js** (v18+) — cho phát triển cục bộ
- **Git**
- Khoảng **4GB RAM** tối thiểu cho Docker containers

---

## Khởi động nhanh (Docker Compose)

### 1. Clone repository

```bash
git clone https://github.com/NEU-DreamChasers/X-Smart.git
cd X-Smart
````

### 2. Tạo file môi trường

Ví dụ `.env` ở root (dùng cho backend):

```env
PORT=8080
DATABASE_URL=postgresql://ngb:ngb@postgres:5432/ngb
SCORPIO_URL=http://scorpio:9090
SCORPIO_API_VERSION=v1
```

Nếu có `.env.example`, bạn có thể sao chép thành `.env`.

### 3. Khởi động các dịch vụ

```bash
docker-compose up -d
```

Các service chính sẽ bao gồm:

- PostgreSQL (cổng 5432)
- Kafka (KRaft mode, cổng 9092)
- Scorpio Context Broker (cổng 9090)
- X-Smart Backend (cổng 8080)
- X-Smart Frontend (cổng 3000)

### 4. Kiểm tra trạng thái dịch vụ

```bash
# Xem log Scorpio
docker-compose logs -f scorpio

# Kiểm tra trạng thái các container
docker-compose ps
```

Mong đợi: các container `Up` và Scorpio ở trạng thái hoạt động.

### 5. Kiểm tra hoạt động

```bash
# Kiểm tra Scorpio
curl http://localhost:9090/ngsi-ld/v1/info

# Kiểm tra backend (nếu có endpoint health)
curl http://localhost:8080/api/entities/health/info

# Mở frontend
xdg-open http://localhost:3000  # hoặc open (macOS) / mở trình duyệt
```

---

## Nạp dữ liệu demo

### Qua API của backend (tương lai)

```bash
curl -X POST "http://localhost:8080/admin/data/load-demo"
```

### Trực tiếp qua Scorpio

Ví dụ tạo entity `WeatherObserved`:

```bash
curl -X POST "http://localhost:9090/ngsi-ld/v1/entities" \
  -H "Content-Type: application/ld+json" \
  -d '{
    "id": "urn:ngsi-ld:WeatherObserved:HanoiCenter:2024-11-17T10:00:00Z",
    "type": "WeatherObserved",
    "dateObserved": { "type": "Property", "value": "2024-11-17T10:00:00Z" },
    "temperature": { "type": "Property", "value": 25.5, "unitCode": "CEL" },
    "location": { "type": "GeoProperty", "value": { "type": "Point", "coordinates": [105.8342, 21.0285] } },
    "@context": [ "https://www.w3.org/ns/data-catalog/context.jsonld", "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld" ]
  }'
```

Hoặc dùng wrapper API của X-Smart:

```bash
curl -X POST "http://localhost:8080/api/entities" \
  -H "Content-Type: application/ld+json" \
  -d '{ "type": "WeatherObserved", "temperature": {"type":"Property","value":25.5}, "location": {"type":"GeoProperty","value":{"type":"Point","coordinates":[105.8342,21.0285]}} }'
```

---

## Phát triển cục bộ (không dùng Docker)

### 1. Cài PostgreSQL + PostGIS

macOS:

```bash
brew install postgresql postgis
createdb ngb
psql ngb -c "CREATE EXTENSION postgis;"
```

Ubuntu/Debian:

```bash
sudo apt-get install postgresql postgresql-contrib postgis
sudo -u postgres createdb ngb
sudo -u postgres psql ngb -c "CREATE EXTENSION postgis;"
```

Windows: cài PostgreSQL, bật extension PostGIS và tạo DB `ngb`.

### 2. Kafka (tuỳ chọn)

Với mục đích phát triển, bạn có thể sử dụng Scorpio all-in-one và bỏ qua Kafka.

### 3. Chạy Scorpio bằng Docker (nếu cần)

Ví dụ container Scorpio (tham khảo cấu hình phù hợp môi trường):

```bash
docker run -d --name scorpio -p 9090:9090 \
  -e DBHOST=host.docker.internal -e DBPORT=5432 -e DBUSER=ngb -e DBPASS=ngb -e DBNAME=ngb \
  scorpiobroker/all-in-one-runner:latest
```

### 4. Chạy Backend

```bash
cd backend
npm install
npm run start:dev
```

### 5. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Khắc phục sự cố Docker

### Scorpio không khởi động

```bash
docker-compose logs scorpio
# Thông thường do Postgres chưa sẵn sàng hoặc port bị chiếm
```

### Lỗi kết nối PostgreSQL

```bash
docker-compose ps postgres
docker-compose restart postgres
```

### Reset toàn bộ

```bash
docker-compose down -v
docker-compose up -d
```

---

## Triển khai production (tổng quan)

- Tạo `.env.production` với biến môi trường cho production
- Sử dụng Kubernetes hoặc orchestrator khác nếu cần mở rộng
- Bảo mật: bật HTTPS, xác thực, quản lý secrets, backup định kỳ

---

## Migration cơ sở dữ liệu (tương lai)

Ví dụ dùng TypeORM:

```bash
npm run typeorm migration:generate
npm run typeorm migration:run
```

---

## Giám sát & Logs

```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f scorpio
```

Health check:

```bash
curl http://localhost:9090/ngsi-ld/v1/info
curl http://localhost:8080/api/entities/health/info
```

---

## Sao lưu & Phục hồi

Backup PostgreSQL:

```bash
docker exec xsmart_postgres pg_dump -U ngb ngb > backup.sql
gzip backup.sql
```

Restore:

```bash
gunzip < backup.sql.gz | docker exec -i xsmart_postgres psql -U ngb ngb
```

---

## Bước tiếp theo

1. Nạp dữ liệu demo
2. Tùy chỉnh data models
3. Xây dựng frontend hiển thị dữ liệu
4. **Integrate Real Data**: Connect OpenWeatherMap, OpenAQ, etc.
5. **Deploy**: Move to cloud (AWS, Azure, GCP, etc.)

---

## Support & Resources

- [Scorpio Documentation](https://scorpio.readthedocs.io/)
- [NGSI-LD Specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.02.02_60/gs_CIM009v010202p.pdf)
- [FiWARE Academy](https://fiware-academy.readthedocs.io/)
- [X-Smart GitHub Issues](https://github.com/NEU-DreamChasers/X-Smart/issues)
