# Phụ Thuộc & Dependencies (Tech Stack)

Dự án X-Smart sử dụng một ngăn xếp công nghệ hiện đại được chọn lựa kỹ lưỡng để đảm bảo hiệu suất, khả năng mở rộng và tiêu chuẩn hóa theo NGSI-LD.

## Tổng Quan

| Lớp                | Công Nghệ               | Phiên Bản       | Mục Đích                            |
| ------------------ | ----------------------- | --------------- | ----------------------------------- |
| **Backend API**    | NestJS                  | 11.0.1          | Khung công tác REST API, vi dịch vụ |
| **Frontend**       | Next.js + React         | 16.0.3 / 19.2.0 | Ứng dụng web, bảng điều khiển       |
| **Cơ Sở Dữ Liệu**  | PostgreSQL + PostGIS    | 16              | Lưu trữ dữ liệu không gian địa lý   |
| **ORM**            | TypeORM                 | 0.3.27          | Ánh xạ đối tượng-quan hệ            |
| **Context Broker** | Scorpio                 | -               | Quản lý thực thể NGSI-LD            |
| **Message Bus**    | Kafka (KRaft)           | -               | Luồng sự kiện, hàng đợi tin nhắn    |
| **Container**      | Docker + Docker Compose | -               | Triển khai ứng dụng                 |

---

## Backend Dependencies (NestJS)

### Dependency Chính

#### HTTP & API

- **axios** (^1.6.5)
  - Client HTTP cho gọi API Scorpio Context Broker
  - Tại sao: Nhẹ, dễ sử dụng, hỗ trợ interceptor
  - Sử dụng: Gửi yêu cầu NGSI-LD đến Scorpio

#### NestJS Framework

- **@nestjs/common** (^11.0.1) - Công cụ cơ bản của NestJS
- **@nestjs/core** (^11.0.1) - Lõi khung công tác
- **@nestjs/platform-express** (^11.0.1) - Trình xử lý HTTP Express
- **@nestjs/config** (^4.0.2)
  - Quản lý cấu hình ứng dụng từ biến môi trường
  - Tại sao: Tách biệt cấu hình khỏi mã, hỗ trợ `.env` files
- **@nestjs/swagger** (^7.1.16)
  - Tạo tài liệu API tự động từ mã
  - Tại sao: Tạo Swagger UI để kiểm tra API
- **@nestjs/typeorm** (^11.0.0)
  - Tích hợp TypeORM vào NestJS
  - Tại sao: Quản lý kết nối cơ sở dữ liệu, migrations

#### Xác Thực Dữ Liệu

- **class-validator** (^0.14.0)
  - Xác thực dữ liệu đầu vào dựa trên decorators
  - Tại sao: Đảm bảo DTOs đúng định dạng, an toàn kiểu TypeScript
- **class-transformer** (^0.5.1)
  - Chuyển đổi JSON thành lớp TypeScript
  - Tại sao: Kết hợp với class-validator, tuân chuẩn DTO

#### Cơ Sở Dữ Liệu

- **typeorm** (^0.3.27)
  - ORM cho TypeScript
  - Tại sao: Quản lý cơ sở dữ liệu, hỗ trợ migrations, relations
- **pg** (^8.16.3)
  - Driver PostgreSQL
  - Tại sao: Kết nối cơ sở dữ liệu PostgreSQL

#### Tiêu Chuẩn & Metadata

- **reflect-metadata** (^0.2.2)
  - Polyfill metadata reflection API
  - Tại sao: Yêu cầu của decorators NestJS
- **uuid** (^9.0.1)
  - Tạo UUID duy nhất cho thực thể
  - Tại sao: Tạo ID NGSI-LD, đảm bảo tính duy nhất toàn cầu

#### API Documentation

- **swagger-ui-express** (^5.0.0)
  - Giao diện web Swagger
  - Tại sao: Hiển thị tài liệu API tương tác

#### Lập Trình Phản Ứng

- **rxjs** (^7.8.1)
  - Thư viện Observable
  - Tại sao: Xử lý bất đồng bộ trong NestJS

### Dev Dependencies

- **@nestjs/cli** (^11.0.0) - Công cụ dòng lệnh NestJS
- **@nestjs/schematics** (^11.0.0) - Mẫu tạo code
- **@nestjs/testing** (^11.0.1) - Công cụ kiểm tra NestJS
- **@types/express** (^5.0.0) - Định nghĩa kiểu Express
- **@types/jest** (^29.0.0) - Định nghĩa kiểu Jest
- **@types/node** (^22.10.7) - Định nghĩa kiểu Node.js
- **@types/supertest** (^6.0.2) - Định nghĩa kiểu Supertest
- **jest** (^29.0.0) - Khung công tác kiểm tra
- **ts-jest** (^29.2.5) - Jest loader cho TypeScript
- **ts-loader** (^9.5.2) - Webpack loader cho TypeScript
- **ts-node** (^10.9.2) - Chạy TypeScript trực tiếp
- **tsconfig-paths** (^4.2.0) - Hỗ trợ đường dẫn tsconfig
- **prettier** (^3.4.2) - Định dạng mã
- **eslint** (^9.18.0) - Kiểm tra mã (Linting)
- **eslint-config-prettier** (^10.0.1) - Cấu hình Prettier cho ESLint
- **eslint-plugin-prettier** (^5.2.2) - Plugin Prettier cho ESLint
- **supertest** (^7.0.0) - Kiểm tra HTTP/API
- **source-map-support** (^0.5.21) - Hỗ trợ source map

---

## Frontend Dependencies (Next.js + React)

### Dependencies Chính

- **next** (16.0.3)
  - Khung công tác React với SSR, SSG, ISR
  - Tại sao: Tối ưu hóa hiệu suất, SEO, routing
- **react** (19.2.0)
  - Thư viện UI component
  - Tại sao: Xây dựng giao diện tương tác
- **react-dom** (19.2.0)
  - Kết xuất React trên DOM trình duyệt
  - Tại sao: Bắt buộc để sử dụng React trên web

### Dev Dependencies

- **@types/node** (^20) - Định nghĩa kiểu Node.js
- **@types/react** (^19) - Định nghĩa kiểu React
- **@types/react-dom** (^19) - Định nghĩa kiểu React DOM
- **typescript** (^5) - Ngôn ngữ TypeScript
- **eslint** (^9) - Kiểm tra mã
- **eslint-config-next** (16.0.3) - Cấu hình ESLint cho Next.js
- **tailwindcss** (^4) - Thư viện CSS utility-first
- **@tailwindcss/postcss** (^4) - Plugin PostCSS cho Tailwind
- **babel-plugin-react-compiler** (1.0.0) - Tối ưu hóa React component

---

## Shared Dependencies

Không có dependencies chính trong `shared/package.json` - được sử dụng cho mã chia sẻ giữa backend và frontend.

---

## Docker & Container Stack

- **Docker** - Containerize ứng dụng
- **Docker Compose** - Điều phối nhiều container
- **Services:**
  - **PostgreSQL 16**: Cơ sở dữ liệu chính
  - **Kafka (KRaft)**: Message broker (không cần Zookeeper)
  - **Scorpio Context Broker**: NGSI-LD broker
  - **Backend NestJS**: REST API
  - **Frontend Next.js**: Ứng dụng web

---

## Tiêu Chuẩn & Mô Hình

- **NGSI-LD (ETSI)**: Tiêu chuẩn quản lý thực thể ngữ cảnh
  - Sử dụng: Giao tiếp với Scorpio Context Broker
- **SOSA/SSN (W3C)**: Ontology cảm biến & quan sát
  - Sử dụng: Mô hình hóa dữ liệu cảm biến
- **FiWARE Smart Data Models**: Mô hình dữ liệu lĩnh vực
  - Sử dụng: Định nghĩa loại thực thể (Device, Location, v.v.)

---

## Cài Đặt & Cập Nhật

### Backend

```bash
cd backend
npm install
# Hoặc cập nhật một package cụ thể
npm install axios@latest
npm update
```

### Frontend

```bash
cd frontend
npm install
npm update
```

### Tất Cả (từ thư mục gốc)

```bash
npm install
npm run build
```

---

## Các Script Có Sẵn

### Backend

```bash
npm run start        # Chạy ứng dụng
npm run start:dev    # Chế độ phát triển với hot reload
npm run start:prod   # Chạy bản phát hành
npm run build        # Biên dịch TypeScript
npm run lint         # Kiểm tra mã
npm run format       # Định dạng mã
npm test             # Chạy kiểm tra
npm run test:cov     # Kiểm tra với coverage
npm run test:e2e     # End-to-end tests
```

### Frontend

```bash
npm run dev          # Chế độ phát triển
npm run build        # Biên dịch ứng dụng
npm start            # Chạy bản phát hành
npm run lint         # Kiểm tra mã
```

---

## Phiên Bản Node.js & NPM

- **Node.js**: >= 20.0.0 (khuyến nghị 22.x)
- **NPM**: >= 10.0.0

---

## Quy Trình Cập Nhật Dependencies

1. Kiểm tra phiên bản mới:

   ```bash
   npm outdated
   ```

2. Cập nhật một package:

   ```bash
   npm install package-name@latest
   ```

3. Cập nhật tất cả:

   ```bash
   npm update
   ```

4. Kiểm tra lỗ hổng bảo mật:
   ```bash
   npm audit
   npm audit fix
   ```

---

## Lựa Chọn Công Nghệ - Lý Do

| Lựa Chọn                 | Lý Do                                                        |
| ------------------------ | ------------------------------------------------------------ |
| **TypeScript**           | An toàn kiểu, phát hiện lỗi sớm                              |
| **NestJS**               | Kiến trúc module, dependency injection, tích hợp sẵn Swagger |
| **Next.js**              | SSR, hiệu suất, thư viện hỗ trợ phong phú                    |
| **PostgreSQL + PostGIS** | Hỗ trợ dữ liệu địa lý, truy vấn không gian                   |
| **TypeORM**              | DBMS agnostic, migrations, quan hệ phức tạp                  |
| **Docker Compose**       | Phát triển địa phương giống production                       |
| **Kafka**                | Phát sóng sự kiện real-time, khả năng mở rộng                |
| **Scorpio NGSI-LD**      | Tuân chuẩn ETSI, quản lý thực thể linh hoạt                  |

---

## Ghi Chú Bảo Mật

- Kiểm tra lỗ hổng: `npm audit`
- Cập nhật thường xuyên để vá lỗi bảo mật
- Sử dụng `.npmrc` để hạn chế phạm vi package (nếu cần)
- Không commit `node_modules` - sử dụng `.gitignore`

---

## Liên Kết Hữu Ích

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [NGSI-LD Specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim_009v010801p.pdf)
- [PostgreSQL + PostGIS](https://postgis.net)
- [Scorpio Broker](https://github.com/ScorpioBroker/ScorpioBroker)
