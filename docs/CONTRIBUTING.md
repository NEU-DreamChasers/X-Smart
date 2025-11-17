# Hướng dẫn đóng góp cho X-Smart

Cảm ơn bạn đã quan tâm đóng góp! Tài liệu này mô tả quy trình làm việc và những hướng dẫn giúp PR của bạn được review và merge nhanh hơn.

- **Mở issue trước**: Nếu phát hiện lỗi hoặc muốn đề xuất tính năng, hãy mở một issue kèm bước tái tạo, hành vi mong đợi so với thực tế, và thông tin môi trường.
- **Làm PR nhỏ**: Giữ PR tập trung vào một thay đổi logic duy nhất khi có thể.
- **Đặt tên nhánh rõ ràng**: Ví dụ `feat/scorpio-setup`, `fix/ngsi-ld-error`, `docs/add-contributing`.
- **Commit message ngắn gọn**: Ví dụ `feat(module): mô tả ngắn` hoặc `fix(api): sửa mã trạng thái`.

Quy trình phát triển

1. Fork repo và tạo nhánh từ `main`.
2. Cài dependency và build cục bộ:

```powershell
cd backend
npm install
npm run build
```

3. Chạy test và lint trước khi mở PR:

```powershell
npm run test
npm run lint
```

4. Mở pull request vào `main`, tham chiếu issue liên quan và mô tả rõ ràng các bước kiểm thử.

Kiểu code

- Backend: theo quy ước TypeScript + NestJS. Ưu tiên dùng kiểu rõ ràng cho API và DTOs.
- Lint & format: tuân theo ESLint/Prettier có trong repo. Chạy `npm run lint` và `npm run format` khi có.

Quy trình review

- PR sẽ được review bởi maintainer. Hãy xử lý các yêu cầu thay đổi bằng commit bổ sung.
- Sau khi được duyệt và CI vượt qua, maintainer sẽ merge PR.

Cảm ơn bạn đã góp phần phát triển X-Smart — mọi đóng góp đều quý giá!
