'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Lấy token từ URL
    const token = searchParams.get('token');

    if (token) {
      console.log("Token received:", token); // Log để kiểm tra
      
      // 2. Lưu token vào LocalStorage
      localStorage.setItem('accessToken', token);
      
      // Giả lập lưu thông tin user (để dashboard hiển thị tạm)
      const userDecode = { name: 'Người dùng Google', role: 'citizen', email: 'user@gmail.com' };
      localStorage.setItem('user', JSON.stringify(userDecode));

      // 3. Chuyển hướng sang trang Dashboard của Người dân
      // Dùng router.replace để người dùng không bấm Back quay lại trang token này được
      router.replace('/citizen');
    } else {
      // Nếu không có token, quay về trang login
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <h2 className="text-2xl font-semibold text-gray-900">Đăng nhập thành công!</h2>
        <p className="text-gray-500">Đang chuyển hướng về trang chủ...</p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}