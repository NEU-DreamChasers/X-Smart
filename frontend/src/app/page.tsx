'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CitizenDashboard } from '../components/CitizenDashboard';
import { AdminDashboard } from '../components/AdminDashboard';

export type UserRole = 'citizen' | 'admin' | 'guest' | null;

export interface User {
  name: string;
  role: UserRole;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>({
    name: 'Khách',
    role: 'guest',
    email: 'guest@thanhphox.gov.vn',
  });
  const handleRedirectToLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    setUser({
      name: 'Khách',
      role: 'guest',
      email: 'guest@thanhphox.gov.vn',
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {user?.role === 'admin' ? (
        <AdminDashboard 
            user={user} 
            onLogout={handleLogout} 
            onLogin={() => {}}
        />
      ) : (
        <CitizenDashboard 
            user={user} 
            onLogout={handleLogout} 
            onLogin={handleRedirectToLogin} 
        />
      )}
    </div>
  );
}