'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Bus, Hospital, School, MapPin, Navigation, Search, Wifi, AlertCircle, Camera, Train, Ambulance, Construction, Waves, Fuel, Loader2 } from 'lucide-react';

// Import Map động
const RealMap = dynamic(() => import('./maps/RealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-[14px]">
      Đang tải bản đồ OSM...
    </div>
  )
});

// Dữ liệu mẫu (Giữ nguyên như cũ)
const nearbyEntities = [
  { 
    id: '001', type: 'BusStop', name: 'Bến xe Bến Thành', distance: 0.3, 
    icon: Bus, color: 'text-blue-600', bgColor: 'bg-blue-50', status: 'active', 
    location: [10.7721, 106.6983] as [number, number],
    data: { routes: ['01', '12', '23'], nextArrival: '3 phút' } 
  },
  { 
    id: '002', type: 'Hospital', name: 'Bệnh viện Chợ Rẫy', distance: 0.8, 
    icon: Hospital, color: 'text-red-600', bgColor: 'bg-red-50', status: 'active', 
    location: [10.7558, 106.6622] as [number, number],
    data: { emergency: true, available: true } 
  },
  { 
    id: '003', type: 'School', name: 'THPT Lê Hồng Phong', distance: 1.2, 
    icon: School, color: 'text-green-600', bgColor: 'bg-green-50', status: 'active', 
    location: [10.7655, 106.6757] as [number, number],
    data: { level: 'high-school', students: 1200 } 
  },
  { 
    id: '004', type: 'AirQualitySensor', name: 'Cảm biến Q1', distance: 0.5, 
    icon: Wifi, color: 'text-purple-600', bgColor: 'bg-purple-50', status: 'active', 
    location: [10.7769, 106.7009] as [number, number],
    data: { pm25: 42, status: 'Tốt' } 
  },
  { 
    id: '005', type: 'MetroStation', name: 'Ga Metro Ba Son', distance: 1.5, 
    icon: Train, color: 'text-indigo-600', bgColor: 'bg-indigo-50', status: 'active', 
    location: [10.7837, 106.7053] as [number, number],
    data: { line: 'Line 1', nextTrain: '5 phút' } 
  },
];

const trafficAlerts = [
  { id: 'alert-001', message: 'Kẹt xe ở đường Lê Duẩn', time: '10 phút trước', icon: AlertCircle, color: 'text-yellow-600' },
  { id: 'alert-003', message: 'Công trình sửa đường - Q3', time: '20 phút trước', icon: Construction, color: 'text-orange-600' },
];

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenMapView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  
  // State quản lý vị trí trung tâm bản đồ
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7721, 106.6983]); // Mặc định Bến Thành
  const [isSearching, setIsSearching] = useState(false);

  //  HÀM GỌI API NOMINATIM (OpenStreetMap Search)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Gọi API tìm kiếm miễn phí của OSM
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Ho Chi Minh City')}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // Cập nhật trung tâm bản đồ
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert('Không tìm thấy địa điểm này!');
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert('Lỗi kết nối đến máy chủ bản đồ.');
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Khi chọn địa điểm từ list, di chuyển bản đồ tới đó
  const handleSelectEntity = (entity: any) => {
    setSelectedEntity(entity);
    setMapCenter(entity.location);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-[14px] p-4 shadow-sm" style={borderStyle}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm địa điểm (VD: Chợ Tân Định)..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyDown={handleKeyDown}
              className="pl-10 rounded-[14px] focus-visible:ring-0 shadow-none" 
              style={borderStyle} 
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-[14px] transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-4">
            <h3 className="text-gray-900 font-medium">Bản đồ thành phố</h3>
            <p className="text-sm text-gray-600">Dữ liệu thời gian thực từ OpenStreetMap</p>
          </div>
          
          <div className="relative rounded-[14px] overflow-hidden border border-black/5" style={{ height: '500px' }}>
            {/* Render Bản đồ */}
            <RealMap 
              entities={nearbyEntities} 
              selectedEntity={selectedEntity} 
              onSelectEntity={handleSelectEntity} 
              center={mapCenter} // Truyền center xuống
            />

            {/* Traffic Alerts Overlay */}
            <div className="absolute bottom-4 left-4 space-y-2 z-[1000] pointer-events-none">
              {trafficAlerts.map((alert) => (
                <div key={alert.id} className="bg-white/95 backdrop-blur rounded-[14px] border-[0.8px] border-black/10 shadow-md p-3 max-w-xs">
                  <div className="flex items-start gap-2">
                    <alert.icon className={`w-4 h-4 mt-0.5 ${alert.color}`} />
                    <div>
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar List */}
        <div className="space-y-4">
          <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
            <div className="mb-4"><h3 className="text-gray-900 font-medium">Địa điểm & Tiện ích</h3></div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {nearbyEntities.map((entity) => (
                <button 
                  key={entity.id} 
                  onClick={() => handleSelectEntity(entity)} 
                  className={`w-full text-left p-3 bg-gray-50 rounded-[14px] hover:bg-gray-100 transition-all ${selectedEntity?.id === entity.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`} 
                  style={borderStyle}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[10px] ${entity.bgColor}`} style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}>
                      <entity.icon className={`w-5 h-5 ${entity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{entity.name}</p>
                      <span className="text-xs text-gray-600">{entity.distance} km</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedEntity && (
            <div className="bg-white rounded-[14px] p-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in" style={borderStyle}>
              <div className="mb-4"><h3 className="text-gray-900 font-medium">Chi tiết: {selectedEntity.name}</h3></div>
              {/* Hiển thị data động */}
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                 {Object.entries(selectedEntity.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium text-gray-900">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                 ))}
              </div>
              <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-[14px] flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                <Navigation className="w-4 h-4" /> Chỉ đường
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}