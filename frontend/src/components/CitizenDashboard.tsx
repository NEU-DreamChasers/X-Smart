'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, LogOut, Map, Store, Leaf, Bell, Building2, MessageSquarePlus } from 'lucide-react';
import type { User as UserType, UserRole } from '../app/page';
import { CitizenMapView } from './CitizenMapView';
import { CitizenServices } from './CitizenServices';
import { CitizenEnvironment } from './CitizenEnvironment';
import { CitizenNotifications } from './CitizenNotifications';
import CitizenReportForm from '@/components/CitizenReportForm';

interface CitizenDashboardProps {
  user: UserType | null;
  onLogout: () => void;
  onLogin: () => void; 
}

// Define strict border style
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenDashboard({ user, onLogout, onLogin }: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState('environment');
  const isGuest = user?.role === 'guest';

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-neutral-950">Thành phố X</h1>
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
                    onClick={onLogin} 
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
            <TabsList className="inline-flex h-16 items-center justify-center !rounded-full bg-[#ececf0] p-2 w-full max-w-5xl gap-2">
              <TabsTrigger value="map" className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Map className="w-5 h-5" />Bản đồ</TabsTrigger>
              <TabsTrigger value="services" className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Store className="w-5 h-5" />Dịch vụ</TabsTrigger>
              <TabsTrigger value="environment" className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Leaf className="w-5 h-5" />Môi trường</TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Bell className="w-5 h-5" />Thông báo</TabsTrigger>
              <TabsTrigger value="report" className="flex-1 flex items-center justify-center gap-2 h-full !rounded-full text-sm font-medium text-gray-600 data-[state=active]:text-neutral-950 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><MessageSquarePlus className="w-5 h-5" />Phản ánh</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map"><CitizenMapView /></TabsContent>
          <TabsContent value="services"><CitizenServices isGuest={isGuest} /></TabsContent>
          <TabsContent value="environment"><CitizenEnvironment /></TabsContent>
          <TabsContent value="notifications"><CitizenNotifications isGuest={isGuest} /></TabsContent>
          
          <TabsContent value="report" className="w-full flex justify-center pb-10">
             <div className="w-full max-w-3xl">
               <div className="bg-white rounded-[14px] shadow-sm overflow-hidden" style={borderStyle}>
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 bg-blue-50 rounded-[10px] text-blue-600">
                        <MessageSquarePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Gửi phản ánh hiện trường</h2>
                        <p className="text-gray-500 text-sm">Đóng góp ý kiến về các vấn đề đô thị</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 bg-white">
                    <CitizenReportForm />
                  </div>
               </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}