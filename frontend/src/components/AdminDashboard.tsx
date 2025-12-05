/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// Đã xóa BarChart3 khỏi import
import { Shield, LogOut, Database, Settings, Map, Inbox, Radio } from 'lucide-react';
import type { User as UserType, UserRole } from '../app/page';
// Đã xóa import AdminOverview
import { AdminDataManagement } from '@/components/AdminDataManagement';
import { AdminAnalytics } from '@/components/AdminAnalytics';
import { AdminMapManagement } from '@/components/AdminMapManagement';
import AdminReportList from '@/components/AdminReportList';
import SensorManagement from '@/components/admin/SensorManagement';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  onLogin: (role: UserRole, user: UserType) => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  // THAY ĐỔI 1: Đặt tab mặc định là 'data' thay vì 'overview'
  const [activeTab, setActiveTab] = useState('data');

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
              {/* THAY ĐỔI 2: Đã xóa TabsTrigger value="overview" tại đây */}

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
              <TabsTrigger value="sensors" className="flex-1 h-full !rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm text-gray-600 gap-2">
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">Cảm biến</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* THAY ĐỔI 3: Đã xóa TabsContent value="overview" tại đây */}

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

          <TabsContent value="sensors">
            <div className="mt-4">
              <SensorManagement />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}