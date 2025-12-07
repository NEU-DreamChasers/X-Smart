'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string; // Đổi thành string để linh hoạt hơn
  fullName?: string;
  avatar?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // 1. Lấy dữ liệu từ LocalStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      // Nếu không có token hoặc user -> Đá về login
      if (!token || !userStr) {
        console.log("Thiếu token hoặc user info");
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userStr);
        
        // --- DEBUG: Kiểm tra xem role thực tế là gì ---
        console.log("🔍 Kiểm tra quyền Admin:", parsedUser);

        // 2. Chuẩn hóa Role về chữ thường để so sánh (tránh lỗi ADMIN vs admin)
        const role = parsedUser.role ? String(parsedUser.role).toLowerCase() : '';

        // 3. Kiểm tra quyền
        if (role !== 'admin') {
          alert(`Tài khoản "${parsedUser.email}" (Quyền: ${parsedUser.role}) không có quyền truy cập trang Quản trị!`);
          router.push('/'); // Đá user thường về trang chủ
          return;
        }

        // 4. Nếu hợp lệ
        setUser(parsedUser);
        setIsLoading(false);

      } catch (error) {
        console.error("Lỗi xác thực:", error);
        // Xóa rác nếu dữ liệu lỗi
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // Xóa cookie nếu có
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-neutral-900" />
          <span className="text-sm text-gray-500 font-medium">Đang xác thực quyền quản trị...</span>
        </div>
      </div>
    );
  }

  // Fallback an toàn nếu user null (dù logic trên đã chặn)
  const safeUser = user || { id: '', email: '', role: 'admin' };

  return (
    <AdminDashboard 
      user={safeUser} 
      onLogout={handleLogout} 
      onLogin={() => {}}
    />
  );
}