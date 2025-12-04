/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
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
      // 2. Lưu token vào LocalStorage
      localStorage.setItem('accessToken', token);
      
      // Giả lập lưu thông tin user cơ bản (Thực tế nên gọi API /profile để lấy thông tin chuẩn)
      // Lưu ý: Decode token JWT ở đây nếu cần lấy info chính xác, 
      // hoặc backend trả về info qua params (nhưng không bảo mật bằng token)
      const userPlaceholder = { 
        name: 'Người dùng Google', 
        role: 'citizen', 
        email: 'user@google.com',
        avatar: '' // Có thể thêm avatar nếu backend trả về
      };
      localStorage.setItem('user', JSON.stringify(userPlaceholder));

      // 3. Chuyển hướng sang trang Dashboard của Người dân
      // Sử dụng setTimeout nhỏ để đảm bảo localStorage kịp lưu trước khi redirect
      setTimeout(() => {
        router.replace('/citizen');
      }, 100);
      
    } else {
      // Nếu không có token hợp lệ, quay về trang login
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center gap-4 border border-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Đăng nhập thành công!</h2>
          <p className="text-gray-500 mt-1">Đang chuyển hướng vào hệ thống...</p>
        </div>
      </div>
    </div>
  );
}

// Bắt buộc bọc trong Suspense khi dùng useSearchParams trong Next.js App Router
export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}