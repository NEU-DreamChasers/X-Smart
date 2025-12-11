/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useRouter } from 'next/navigation';
// Đảm bảo đường dẫn import component đúng với dự án của bạn
import { CitizenDashboard } from '@/components/citizen/CitizenDashboard'; 
// 1. Import Component tải dữ liệu mới
import CitizenDataLoader from '@/components/citizen/CitizenDataLoader';

export default function CitizenPage() {
  const router = useRouter();
  
  // Tạm thời vẫn dùng mockUser, sau này ta sẽ lấy từ Token sau
  const mockUser = { name: 'Nguyễn Văn A', role: 'citizen' as const, email: 'dan@gov.vn' };

  const handleLogout = () => {
    // THÊM: Xóa token khi đăng xuất
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    router.push('/login'); // Chuyển về trang login (SimpleLogin)
  };

  return (
    // 2. Truyền CitizenDataLoader làm con (children) của CitizenDashboard
    <CitizenDashboard 
      user={mockUser} 
      onLogout={handleLogout} 
      onLogin={() => {}} 
    >
      <CitizenDataLoader />
    </CitizenDashboard>
  );
}