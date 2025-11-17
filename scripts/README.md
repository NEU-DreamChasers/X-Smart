# scripts/

> Thư mục chứa các script tiện ích giúp thiết lập và chạy dự án X-Smart.

Các file chính:

- `setup.bat` — script thiết lập cho Windows (CMD/PowerShell). Cài dependencies cho `backend` và `frontend`, sao chép `.env` từ `.env.example` nếu chưa có và chạy `docker-compose up -d --build`.
- `setup.sh` — script cho hệ POSIX (Linux/macOS). Hành vi tương tự `setup.bat` nhưng viết bằng bash.

Ví dụ sử dụng

Windows (PowerShell / CMD):

```powershell
# từ thư mục gốc của repo
scripts\setup.bat
```

Unix (macOS / Linux):

```bash
# cấp quyền thực thi (chỉ cần làm một lần)
chmod +x scripts/setup.sh
# chạy
./scripts/setup.sh
```

Ghi chú

- Cả hai script giả định bạn đã cài Docker và Docker Compose và có trong `PATH`.
- Các script được giữ tối giản: cài deps và khởi động stack Compose. Bạn có thể mở rộng để chạy migration, seed dữ liệu, hoặc kiểm tra dịch vụ.
- Trong CI, nên gọi các npm script hoặc bước CI chuyên dụng thay vì dùng script cục bộ này.

Muốn thêm script nào nữa (ví dụ `wait-for`, `health-check`, `db-backup`) hãy báo tôi — tôi sẽ tạo sẵn.
