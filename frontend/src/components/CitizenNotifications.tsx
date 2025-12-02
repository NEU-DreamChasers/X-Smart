'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Bell, Info, CheckCircle2, Clock } from 'lucide-react';

interface CitizenNotificationsProps { isGuest?: boolean; }

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  reportId?: string;
}

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function CitizenNotifications({ isGuest = false }: CitizenNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- 1. HÀM LẤY DỮ LIỆU (FETCH) ---
  const fetchNotifications = async () => {
    if (isGuest) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    }
  };

  // --- 2. HÀM ĐÁNH DẤU ĐÃ ĐỌC ---
  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    const token = localStorage.getItem('access_token');
    if (token) {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };

  // --- 3. POLLING (Tự động cập nhật mỗi 15s) ---
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isGuest]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Cảnh báo dành cho khách vãng lai */}
      {isGuest && (
        <div className="bg-blue-50 rounded-[14px] p-4 shadow-sm border border-blue-100">
          <div className="flex gap-3">
            <div className="p-2 bg-white rounded-full shrink-0 shadow-sm text-xl">👋</div>
            <div>
              <p className="text-sm font-bold text-blue-900">Chào mừng bạn!</p>
              <p className="text-xs text-blue-700 mt-1">
                Hãy <span className="font-bold underline cursor-pointer">đăng nhập</span> để gửi phản ánh và nhận thông báo khi cơ quan chức năng xử lý.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[14px] p-6 shadow-sm flex-1 flex flex-col overflow-hidden" style={borderStyle}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Thông báo của bạn
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Cập nhật từ hệ thống quản trị</p>
          </div>
          
          {/* Badge đếm số chưa đọc */}
          {unreadCount > 0 ? (
            <Badge variant="secondary" className="rounded-full bg-red-50 text-red-600 border-red-100 px-3 py-1 animate-pulse">
              {unreadCount} mới
            </Badge>
          ) : (
             <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-500 px-3 py-1">
              0 mới
            </Badge>
          )}
        </div>
        
        {/* Nội dung danh sách (Có cuộn dọc) */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            // --- TRẠNG THÁI RỖNG ---
            <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Info className="w-6 h-6 text-gray-300"/>
              </div>
              <p className="font-medium text-gray-600">Chưa có thông báo nào</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Khi Admin duyệt báo cáo của bạn, thông báo sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            // --- DANH SÁCH THÔNG BÁO ---
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group
                  ${!n.isRead 
                    ? 'bg-blue-50/60 border-blue-100 shadow-sm hover:bg-blue-100/50'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
              >
                {/* Chấm đỏ báo hiệu chưa đọc */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full shadow-sm ring-4 ring-blue-50"></span>
                )}

                <div className="flex gap-3">
                  {/* Icon trạng thái: Chuông hoặc Check */}
                  <div className={`mt-1 p-2 rounded-full shrink-0 h-fit ${
                    n.title.includes('duyệt') || n.title.includes('tiếp nhận') 
                      ? 'bg-green-100 text-green-600' 
                      : n.title.includes('từ chối') 
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                     {n.isRead ? <CheckCircle2 className="w-4 h-4"/> : <Bell className="w-4 h-4"/>}
                  </div>
                  
                  <div className="flex-1 pr-6">
                    <h4 className={`text-sm mb-1 ${!n.isRead ? 'font-bold text-blue-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                      {n.message}
                    </p>
                    
                    {/* Thời gian */}
                    <div className="flex items-center gap-1 mt-2.5 text-[10px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}