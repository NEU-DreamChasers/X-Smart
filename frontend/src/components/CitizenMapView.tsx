'use client';

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Bus, Hospital, School, MapPin, Navigation, Search, Wifi, AlertCircle } from 'lucide-react';

const nearbyEntities = [
  { id: '001', type: 'BusStop', name: 'Bến xe Bến Thành', distance: 0.3, icon: Bus, color: 'text-blue-600', bgColor: 'bg-blue-50', status: 'active', data: { routes: ['01', '12', '23'], nextArrival: '3 phút' } },
  { id: '002', type: 'Hospital', name: 'Bệnh viện Chợ Rẫy', distance: 0.8, icon: Hospital, color: 'text-red-600', bgColor: 'bg-red-50', status: 'active', data: { emergency: true, available: true } },
  { id: '003', type: 'School', name: 'THPT Lê Hồng Phong', distance: 1.2, icon: School, color: 'text-green-600', bgColor: 'bg-green-50', status: 'active', data: { level: 'high-school', students: 1200 } },
  { id: '004', type: 'AirQualitySensor', name: 'Cảm biến Q1', distance: 0.5, icon: Wifi, color: 'text-purple-600', bgColor: 'bg-purple-50', status: 'active', data: { pm25: 42, status: 'Tốt' } },
];

const trafficAlerts = [
  { id: 'alert-001', message: 'Kẹt xe ở đường Lê Duẩn', time: '10 phút trước' },
  { id: 'alert-002', message: 'Không khí tốt hôm nay', time: '1 giờ trước' },
];

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenMapView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<typeof nearbyEntities[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[14px] p-4 shadow-sm" style={borderStyle}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm địa điểm..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 rounded-[14px] focus-visible:ring-0 shadow-none" 
              style={borderStyle} 
            />
          </div>
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-[14px] transition-colors flex items-center gap-2">
            <Navigation className="w-4 h-4" /> Vị trí hiện tại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-4">
            <h3 className="text-gray-900 font-medium">Bản đồ thành phố</h3>
            <p className="text-sm text-gray-600">Dữ liệu thời gian thực</p>
          </div>
          <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-[14px] overflow-hidden" style={{ height: '500px', ...borderStyle }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-400/30"></div>
                <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-400/30"></div>
                {nearbyEntities.map((entity, index) => {
                  const Icon = entity.icon;
                  const pos = [{ top: '25%', left: '30%' }, { top: '35%', right: '25%' }, { bottom: '30%', left: '25%' }, { top: '40%', left: '50%' }][index] || { top: '50%', left: '50%' };
                  return (
                    <button key={entity.id} onClick={() => setSelectedEntity(entity)} className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${selectedEntity?.id === entity.id ? 'scale-125 z-10' : ''}`} style={pos}>
                      <div className={`w-12 h-12 rounded-full ${entity.bgColor} flex items-center justify-center shadow-md bg-white`} style={{ border: '2px solid white' }}>
                        <Icon className={`w-6 h-6 ${entity.color}`} />
                      </div>
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        {/* 👇 TEXT COLOR CHANGED TO DARK (text-neutral-950) */}
                        <Badge variant="secondary" className="text-xs shadow-sm bg-white/90 backdrop-blur rounded-md text-neutral-950" style={borderStyle}>
                          {entity.distance} km
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-white rounded-[14px] shadow-sm p-3 space-y-2" style={borderStyle}>
              <p className="text-sm text-gray-900 font-medium">Chú giải:</p>
              <div className="flex items-center gap-2"><Bus className="w-4 h-4 text-blue-600" /><span className="text-xs text-gray-600">Giao thông</span></div>
              <div className="flex items-center gap-2"><Hospital className="w-4 h-4 text-red-600" /><span className="text-xs text-gray-600">Y tế</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
            <div className="mb-4"><h3 className="text-gray-900 font-medium">Địa điểm gần bạn</h3></div>
            <div className="space-y-3">
              {nearbyEntities.map((entity) => (
                <button key={entity.id} onClick={() => setSelectedEntity(entity)} className={`w-full text-left p-3 bg-gray-50 rounded-[14px] hover:bg-gray-100 transition-all ${selectedEntity?.id === entity.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`} style={borderStyle}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[10px] ${entity.bgColor}`} style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}><entity.icon className={`w-5 h-5 ${entity.color}`} /></div>
                    <div className="flex-1"><p className="text-sm text-gray-900 font-medium">{entity.name}</p><span className="text-xs text-gray-600">{entity.distance} km</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {selectedEntity && (
            <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
              <div className="mb-4"><h3 className="text-gray-900 font-medium">Chi tiết: {selectedEntity.name}</h3></div>
              {selectedEntity.type === 'BusStop' && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Tuyến xe buýt</p>
                    <div className="flex gap-1">
                        {selectedEntity.data.routes?.map(route => (
                           
                            <Badge key={route} variant="outline" className="rounded-md bg-white text-neutral-950" style={borderStyle}>{route}</Badge>
                        ))}
                    </div>
                  </div>
              )}
              <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-[14px] flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Chỉ đường</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}