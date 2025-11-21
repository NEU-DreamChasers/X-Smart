'use client';

import { Badge } from './ui/badge';
import { Bus, ParkingCircle, Zap, Droplets, Phone, Clock, CheckCircle } from 'lucide-react';

interface CitizenServicesProps { isGuest?: boolean; }

const services = [
  {
    category: 'Giao thông công cộng', icon: Bus, color: 'text-blue-600', bgColor: 'bg-blue-50',
    items: [ { name: 'Lịch trình xe buýt', status: 'Hoạt động', update: '5 phút trước' }, { name: 'Thông tin tuyến đường', status: 'Hoạt động', update: '10 phút trước' }, { name: 'Tra cứu giá vé', status: 'Hoạt động', update: '1 giờ trước' } ],
  },
  {
    category: 'Bãi đỗ xe', icon: ParkingCircle, color: 'text-green-600', bgColor: 'bg-green-50',
    items: [ { name: 'Chỗ trống Quận 1', status: '234 chỗ', update: 'Thời gian thực' }, { name: 'Chỗ trống Quận 2', status: '156 chỗ', update: 'Thời gian thực' }, { name: 'Đặt chỗ trước', status: 'Hoạt động', update: '2 phút trước' } ],
  },
  {
    category: 'Điện & Nước', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50',
    items: [ { name: 'Tra cứu hóa đơn điện', status: 'Hoạt động', update: '1 ngày trước' }, { name: 'Tra cứu hóa đơn nước', status: 'Hoạt động', update: '1 ngày trước' }, { name: 'Thanh toán online', status: 'Hoạt động', update: '30 phút trước' } ],
  },
  {
    category: 'Đèn đường thông minh', icon: Droplets, color: 'text-purple-600', bgColor: 'bg-purple-50',
    items: [ { name: 'Báo cáo đèn hỏng', status: 'Hoạt động', update: '15 phút trước' }, { name: 'Trạng thái sửa chữa', status: '12 đang xử lý', update: '20 phút trước' }, { name: 'Lịch sử bảo trì', status: 'Hoạt động', update: '2 giờ trước' } ],
  },
];

const recentReports = [
  { id: 'R001', title: 'Đèn đường hỏng - Đường Lê Duẩn', status: 'processing', date: '08/11/2024', response: 'Đang xử lý' },
  { id: 'R002', title: 'Hỏng hệ thống thoát nước', status: 'completed', date: '05/11/2024', response: 'Đã hoàn thành' },
  { id: 'R003', title: 'Yêu cầu thêm bãi đỗ xe', status: 'pending', date: '07/11/2024', response: 'Đang chờ xử lý' },
];

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenServices({ isGuest = false }: CitizenServicesProps) {
  return (
    <div className="space-y-6">
      {isGuest && (
        <div className="bg-blue-50 rounded-[14px] p-4 shadow-sm" style={{ border: '0.8px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-sm text-blue-900">💡 <strong>Lưu ý:</strong> Đăng nhập để gửi báo cáo và theo dõi trạng thái xử lý của bạn.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.category} className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={borderStyle}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-[10px] ${service.bgColor}`} style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}>
                  <Icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <h3 className="text-gray-900 font-medium">{service.category}</h3>
              </div>
              <div className="space-y-3">
                {service.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-[14px] hover:bg-white transition-colors" style={borderStyle}>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.update}</p>
                    </div>
                    {/* 👇 TEXT COLOR CHANGED TO DARK (text-neutral-950) */}
                    <Badge variant="outline" className="bg-white shadow-none text-neutral-950" style={borderStyle}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="mb-4">
          <h3 className="text-gray-900 font-medium">Hành động nhanh</h3>
          <p className="text-sm text-gray-600">Các tiện ích thường dùng</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Phone, text: 'Báo cáo sự cố' },
            { icon: Clock, text: 'Lịch trình xe buýt' },
            { icon: CheckCircle, text: 'Tra cứu hóa đơn' }
          ].map((action, i) => (
             <button key={i} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-[14px] transition-colors flex flex-col items-center gap-2 group" style={borderStyle}>
                <action.icon className="w-6 h-6 text-gray-900 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm text-gray-900 font-medium">{action.text}</span>
             </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
        <div className="mb-4">
          <h3 className="text-gray-900 font-medium">Báo cáo của tôi</h3>
          <p className="text-sm text-gray-600">Theo dõi trạng thái xử lý</p>
        </div>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 bg-gray-50/50 rounded-[14px]" style={borderStyle}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-900 font-medium">{report.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Mã: {report.id} • {report.date}</p>
                </div>
             
                <Badge 
                  variant={report.status === 'completed' ? 'default' : report.status === 'processing' ? 'secondary' : 'outline'} 
                  className="rounded-md shadow-none text-neutral-950" 
                  style={report.status === 'pending' ? borderStyle : undefined}
                >
                  {report.response}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}