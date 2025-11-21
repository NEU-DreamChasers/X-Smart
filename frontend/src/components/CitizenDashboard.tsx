'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, LogOut, Map, Store, Leaf, Bell, LogIn, Building2 } from 'lucide-react';
import type { User as UserType, UserRole } from '../app/page';
import { CitizenMapView } from './CitizenMapView';
import { CitizenServices } from './CitizenServices';
import { CitizenEnvironment } from './CitizenEnvironment';
import { CitizenNotifications } from './CitizenNotifications';
import { LoginModal } from './LoginModal';

interface CitizenDashboardProps {
  user: UserType | null;
  onLogout: () => void;
  onLogin: (role: UserRole, user: UserType) => void;
}

export function CitizenDashboard({ user, onLogout, onLogin }: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState('environment');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isGuest = user?.role === 'guest';

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header: Removed border-b */}
      <header className="bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-neutral-950">Thành phố X</h1>
                {/* Darkened subtitle color */}
                <p className="text-xs text-gray-700">Nền tảng dữ liệu mở</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isGuest ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-neutral-900">Khách</span>
                  </div>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-sm font-medium text-neutral-900 hover:text-neutral-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    {/* Changed to darker text color */}
                    <span className="text-sm font-medium text-neutral-900">{user?.name || 'Nguyễn Văn A'}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-neutral-900 hover:text-neutral-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center w-full mb-8">
            {/* Thêm dấu '!' vào trước rounded-full để ép buộc bo tròn */}
            <TabsList className="inline-flex h-16 items-center justify-center !rounded-full bg-[#ececf0] p-2 w-full max-w-4xl gap-2">
              
              <TabsTrigger 
                value="map" 
                className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Map className="w-5 h-5" />
                Bản đồ
              </TabsTrigger>
              
              <TabsTrigger 
                value="services" 
                className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Store className="w-5 h-5" />
                Dịch vụ
              </TabsTrigger>
              
              <TabsTrigger 
                value="environment" 
                className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Leaf className="w-5 h-5" />
                Môi trường
              </TabsTrigger>
              
              <TabsTrigger 
                value="notifications" 
                className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Bell className="w-5 h-5" />
                Thông báo
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="map">
            <CitizenMapView />
          </TabsContent>

          <TabsContent value="services">
            <CitizenServices isGuest={isGuest} />
          </TabsContent>

          <TabsContent value="environment">
            <CitizenEnvironment />
          </TabsContent>

          <TabsContent value="notifications">
            <CitizenNotifications isGuest={isGuest} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Login Modal */}
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={onLogin}
      />
    </div>
  );
}