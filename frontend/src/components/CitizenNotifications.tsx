'use client';

import { Badge } from './ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle, Calendar } from 'lucide-react';

interface CitizenNotificationsProps { isGuest?: boolean; }

const notifications = [
  { id: 1, type: 'alert', title: 'Cảnh báo kẹt xe', message: 'Kẹt xe nghiêm trọng trên đường Lê Duẩn...', time: '10 phút trước', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', read: false },
  { id: 2, type: 'info', title: 'Cập nhật lịch trình xe buýt', message: 'Tuyến 12 tạm ngừng hoạt động...', time: '1 giờ trước', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', read: false },
  { id: 3, type: 'success', title: 'Báo cáo đã được xử lý', message: 'Báo cáo "Đèn đường hỏng" đã xong', time: '2 giờ trước', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', read: true },
];

const upcomingEvents = [
  { title: 'Bảo trì hệ thống điện', date: '12/11/2024', time: '08:00 - 12:00', area: 'Quận 3' },
  { title: 'Làm việc cải tạo đường', date: '15/11/2024', time: '06:00 - 18:00', area: 'Đường Nguyễn Huệ' },
];

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenNotifications({ isGuest = false }: CitizenNotificationsProps) {
  return (
    <div className="space-y-6">
      {isGuest && (
        <div className="bg-blue-50 rounded-[14px] p-4 shadow-sm" style={{ border: '0.8px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-sm text-blue-900">💡 <strong>Lưu ý:</strong> Đăng nhập để nhận thông báo.</p>
        </div>
      )}

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 font-medium">Thông báo của bạn</h3>
            <p className="text-sm text-gray-600">Cập nhật mới nhất</p>
          </div>
          {/* 👇 TEXT COLOR CHANGED TO DARK (text-neutral-950) */}
          <Badge variant="secondary" className="rounded-full shadow-none bg-gray-100 text-neutral-950" style={borderStyle}>{notifications.filter(n => !n.read).length} mới</Badge>
        </div>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className={`p-4 rounded-[14px] transition-colors ${!notification.read ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                   style={!notification.read ? { border: '0.8px solid rgba(59, 130, 246, 0.2)' } : borderStyle}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-[10px] ${notification.bgColor} flex-shrink-0`} style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}>
                    <Icon className={`w-5 h-5 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="mb-4">
          <h3 className="text-gray-900 font-medium">Lịch sự kiện sắp tới</h3>
          <p className="text-sm text-gray-600">Hoạt động bảo trì</p>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-[14px]" style={borderStyle}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-[10px]" style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}>
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{event.title}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>📅 {event.date}</span><span>🕐 {event.time}</span><span>📍 {event.area}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="mb-4">
          <h3 className="text-gray-900 font-medium">Cài đặt thông báo</h3>
          <p className="text-sm text-gray-600">Tùy chỉnh</p>
        </div>
        <div className="space-y-3">
          {[{ label: 'Cảnh báo giao thông', enabled: true }, { label: 'Cập nhật môi trường', enabled: true }, { label: 'Sự kiện cộng đồng', enabled: false }].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-[14px]" style={borderStyle}>
              <span className="text-sm text-gray-900 font-medium">{setting.label}</span>
           
              <Badge 
                variant={setting.enabled ? 'default' : 'outline'} 
                className="cursor-pointer shadow-none text-neutral-950" 
                style={!setting.enabled ? borderStyle : undefined}
              >
                {setting.enabled ? 'Bật' : 'Tắt'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}