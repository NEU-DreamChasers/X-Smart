'use client';

import { Badge } from './ui/badge';
import { Bell, Info } from 'lucide-react';

interface CitizenNotificationsProps { isGuest?: boolean; }

// Hiện tại chưa có API thông báo cá nhân, để mảng rỗng để xóa nội dung cũ
const notifications: any[] = []; 

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenNotifications({ isGuest = false }: CitizenNotificationsProps) {
  return (
    <div className="space-y-6">
      {isGuest && (
        <div className="bg-blue-50 rounded-[14px] p-4 shadow-sm" style={{ border: '0.8px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-sm text-blue-900">💡 <strong>Lưu ý:</strong> Đăng nhập để nhận thông báo về trạng thái phản ánh của bạn.</p>
        </div>
      )}

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 font-medium">Thông báo của bạn</h3>
            <p className="text-sm text-gray-600">Trạng thái duyệt phản ánh</p>
          </div>
          <Badge variant="secondary" className="rounded-full shadow-none bg-gray-100 text-neutral-950" style={borderStyle}>
             {notifications.length} mới
          </Badge>
        </div>
        
        {/* Nội dung thông báo */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <Info className="w-8 h-8 text-gray-300 mb-2"/>
                  <p>Chưa có thông báo mới về phản ánh của bạn.</p>
              </div>
          ) : (
             notifications.map((n) => (
                <div key={n.id}>Currently Empty</div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}