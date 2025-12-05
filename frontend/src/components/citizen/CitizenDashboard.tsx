'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, LogOut, Map, Leaf, Bell, Building2, MessageSquarePlus, LogIn } from 'lucide-react';
import type { User as UserType } from '../../app/page';
import { CitizenMapView } from './CitizenMapView';
import { CitizenEnvironment } from './CitizenEnvironment';
import { CitizenNotifications } from '@/components/citizen/CitizenNotifications';
import CitizenReportForm from '@/components/citizen/CitizenReportForm';
import CitizenReportHistory from '@/components/citizen/CitizenReportHistory';

interface CitizenDashboardProps {
  user: UserType | null;
  onLogout?: () => void;
  onLogin?: () => void; 
}

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenDashboard({ user: propUser, onLogout, onLogin }: CitizenDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('environment');
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Lỗi parse user:", e);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  const handleReportSuccess = () => {
    setRefreshHistoryTrigger(prev => prev + 1);
  };

  const handleLogoutAction = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    if (onLogout) onLogout();
    window.location.href = '/citizen';
  };

  const handleLoginAction = () => {
    if (onLogin) onLogin();
    router.push('/login');
  };

  const displayUser = isClient ? currentUser : propUser;
  const isGuest = !displayUser;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* HEADER: Áp dụng style nhẹ nhàng hơn */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-[14px] flex items-center justify-center shadow-blue-100 shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-neutral-950 uppercase tracking-wide">Thành phố X</h1>
                <p className="text-xs text-gray-500 font-medium">Nền tảng dữ liệu mở</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isGuest ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-[14px]" style={borderStyle}>
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Khách vãng lai</span>
                  </div>
                  <button 
                    onClick={handleLoginAction} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-[14px] hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {displayUser?.fullName || displayUser?.name || displayUser?.email || 'Công dân'}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                        {displayUser?.role === 'admin' ? 'Quản trị viên' : 'Công dân số'}
                      </p>
                    </div>
                    <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600" style={borderStyle}>
                      {displayUser?.avatar ? (
                        <img src={displayUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={handleLogoutAction}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[10px] transition-all"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gray-100"></div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center w-full">
            <TabsList className="inline-flex h-14 items-center justify-center rounded-full bg-white p-1.5 w-full max-w-4xl gap-1" style={borderStyle}>
              <TabsTrigger value="map" className="flex-1 rounded-full text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 h-full transition-all"><Map className="w-4 h-4 mr-2" />Bản đồ</TabsTrigger>
              <TabsTrigger value="environment" className="flex-1 rounded-full text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 h-full transition-all"><Leaf className="w-4 h-4 mr-2" />Môi trường</TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 rounded-full text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 h-full transition-all"><Bell className="w-4 h-4 mr-2" />Thông báo</TabsTrigger>
              <TabsTrigger value="report" className="flex-1 rounded-full text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 h-full transition-all"><MessageSquarePlus className="w-4 h-4 mr-2" />Phản ánh</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="animate-in fade-in-50 duration-500"><CitizenMapView /></TabsContent>
          <TabsContent value="environment" className="animate-in fade-in-50 duration-500"><CitizenEnvironment /></TabsContent>
          <TabsContent value="notifications" className="animate-in fade-in-50 duration-500"><CitizenNotifications isGuest={isGuest} /></TabsContent>
          
          <TabsContent value="report" className="w-full pb-10 animate-in fade-in-50 duration-500">
             <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               <div 
                  className="lg:col-span-2 bg-white rounded-[14px] shadow-sm overflow-hidden"
                  style={borderStyle}
               >
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center text-blue-600">
                        <MessageSquarePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Gửi phản ánh hiện trường</h2>
                        <p className="text-sm text-gray-500">Đóng góp ý kiến về các vấn đề đô thị</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <CitizenReportForm onSuccess={handleReportSuccess} />
                  </div>
               </div>

               
               <div className="lg:col-span-1 h-full">
                 {!isGuest ? (
                   
                   <div className="h-full">
                      <CitizenReportHistory refreshTrigger={refreshHistoryTrigger} />
                   </div>
                 ) : (
                   <div 
                      className="bg-white rounded-[14px] p-8 shadow-sm text-center h-fit sticky top-24"
                      style={borderStyle}
                   >
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <User className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">Đăng nhập để xem lịch sử</h3>
                     <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                       Bạn cần có tài khoản công dân để theo dõi trạng thái xử lý các phản ánh của mình.
                     </p>
                     <button 
                        onClick={handleLoginAction} 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[12px] transition-all shadow-sm active:scale-95"
                     >
                        Đăng nhập ngay
                     </button>
                   </div>
                 )}
               </div>

             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}