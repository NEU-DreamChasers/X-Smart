  'use client';
  
  import { useState } from 'react';
  import { CitizenDashboard } from '../components/CitizenDashboard';
  import { AdminDashboard } from '../components/AdminDashboard';
  
  export type UserRole = 'citizen' | 'admin' | 'guest' | null;
  
  export interface User {
    name: string;
    role: UserRole;
    email: string;
  }
  
  export default function Home() {
    // Start with guest user by default
    const [user, setUser] = useState<User | null>({
      name: 'Khách',
      role: 'guest',
      email: 'guest@thanhphox.gov.vn',
    });
  
    const handleLogin = (role: UserRole, userData: User) => {
      setUser(userData);
    };
  
    const handleLogout = () => {
      // Return to guest mode instead of login screen
      setUser({
        name: 'Khách',
        role: 'guest',
        email: 'guest@thanhphox.gov.vn',
      });
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        {user?.role === 'admin' ? (
          <AdminDashboard user={user} onLogout={handleLogout} onLogin={handleLogin} />
        ) : (
          <CitizenDashboard user={user} onLogout={handleLogout} onLogin={handleLogin} />
        )}
      </div>
    );
  }