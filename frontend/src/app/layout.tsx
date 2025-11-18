import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nền Tảng Dữ Liệu Đô Thị Mở - Thành phố X',
  description: 'Hệ thống tích hợp dữ liệu IoT theo tiêu chuẩn NGSI-LD và SOSA/SSN',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
