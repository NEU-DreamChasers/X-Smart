'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, LogOut, BarChart3, Database, Settings, Map, Inbox } from 'lucide-react';
import type { User as UserType, UserRole } from '../app/page';
import { AdminOverview } from './AdminOverview';
import { AdminDataManagement } from './AdminDataManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminMapManagement } from './AdminMapManagement';
import AdminReportList from '@/components/AdminReportList';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onLogin: (role: UserRole, user: UserType) => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-[14px] shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-neutral-950 font-medium text-lg">Bảng điều khiển quản trị</h1>
                <p className="text-xs text-gray-600">Nền tảng dữ liệu đô thị mở</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-black/5">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-neutral-900">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full">
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center w-full">
            <TabsList className="inline-flex h-14 items-center justify-center !rounded-full bg-gray-100 p-1.5 w-full max-w-4xl gap-2">
              <TabsTrigger value="overview" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Dữ liệu</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Bản đồ</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <Inbox className="w-4 h-4" />
                <span className="hidden sm:inline">Phản ánh</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Phân tích</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="data">
            <AdminDataManagement />
          </TabsContent>

          <TabsContent value="map">
            <AdminMapManagement />
          </TabsContent>

          {/* REPORTS TAB: List of citizen reports (Inbox) */}
          <TabsContent value="reports" className="w-full flex justify-center pb-10">
             <div className="w-full max-w-4xl">
                 <AdminReportList />
             </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}