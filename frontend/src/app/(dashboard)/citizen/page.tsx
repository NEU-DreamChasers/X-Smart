'use client';

import { useRouter } from 'next/navigation';
import { CitizenDashboard } from '@/components/CitizenDashboard';

export default function CitizenPage() {
  const router = useRouter();
  const mockUser = { name: 'Nguyễn Văn A', role: 'citizen' as const, email: 'dan@gov.vn' };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <CitizenDashboard 
      user={mockUser} 
      onLogout={handleLogout} 
      onLogin={() => {}} 
    />
  );
}