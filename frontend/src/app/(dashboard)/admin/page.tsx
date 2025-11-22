'use client';

import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  // const { user, logout } = useAuth();
  const mockUser = { name: 'Quản trị viên', role: 'admin' as const, email: 'admin@gov.vn' };

  const handleLogout = () => {
    // logout();
    router.push('/login');
  };

  return (
    <AdminDashboard 
      user={mockUser} 
      onLogout={handleLogout} 
      onLogin={() => {}}
    />
  );
}