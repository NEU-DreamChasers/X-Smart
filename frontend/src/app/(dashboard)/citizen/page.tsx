'use client';

import { useRouter } from 'next/navigation';
// Đảm bảo đường dẫn import component đúng với dự án của bạn
import { CitizenDashboard } from '@/components/citizen/CitizenDashboard'; 

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
    <CitizenDashboard 
      user={mockUser} 
      onLogout={handleLogout} 
      onLogin={() => {}} 
    />
  );
}