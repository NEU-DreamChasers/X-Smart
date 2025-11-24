'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Layers, MapPin, AlertTriangle, Camera, Signal, RadioTower, Bus, Wifi, ParkingCircle } from 'lucide-react';

const RealMap = dynamic(() => import('./maps/RealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-[14px]">
      Đang tải bản đồ OpenStreetMap...
    </div>
  )
});

const mockMapEntities = [
  // Bus Stops
  { id: 'bus-1', type: 'BusStop', name: 'Trạm Bến Thành', location: [10.7705, 106.6993], icon: Bus, color: 'text-blue-600', status: 'active' },
  { id: 'bus-2', type: 'BusStop', name: 'Trạm Hàm Nghi', location: [10.7715, 106.7030], icon: Bus, color: 'text-blue-600', status: 'active' },
  
  // Sensors
  { id: 'sensor-1', type: 'AirQuality', name: 'Sensor Lê Duẩn', location: [10.7800, 106.6980], icon: Wifi, color: 'text-green-600', status: 'active' },
  { id: 'sensor-2', type: 'AirQuality', name: 'Sensor Q3', location: [10.7750, 106.6850], icon: Wifi, color: 'text-green-600', status: 'active' },

  // Cameras
  { id: 'cam-1', type: 'TrafficCamera', name: 'Cam Ngã 6 Phù Đổng', location: [10.7721, 106.6920], icon: Camera, color: 'text-gray-600', status: 'active' },
  { id: 'cam-2', type: 'TrafficCamera', name: 'Cam Hầm Thủ Thiêm', location: [10.7680, 106.7050], icon: Camera, color: 'text-gray-600', status: 'inactive' },

  // Parking
  { id: 'park-1', type: 'Parking', name: 'Bãi xe Vincom', location: [10.7785, 106.7015], icon: ParkingCircle, color: 'text-yellow-600', status: 'active' },
  
  // Telecom
  { id: 'tel-1', type: 'Telecom', name: 'Trạm BTS Bitexco', location: [10.7716, 106.7044], icon: RadioTower, color: 'text-purple-600', status: 'active' },
];

// Cấu hình các lớp (Layers)
const mapLayersInitial = [
  { name: 'Bến xe buýt', type: 'BusStop', count: 389, visible: true, color: '#3b82f6' },
  { name: 'Cảm biến không khí', type: 'AirQuality', count: 245, visible: true, color: '#10b981' },
  { name: 'Bãi đỗ xe', type: 'Parking', count: 567, visible: true, color: '#f59e0b' },
  { name: 'Camera Giao thông', type: 'TrafficCamera', count: 120, visible: false, color: '#6b7280' }, // Mặc định ẩn
  { name: 'Đèn tín hiệu', type: 'TrafficLight', count: 450, visible: false, color: '#ef4444' },
  { name: 'Hệ thống viễn thông', type: 'Telecom', count: 89, visible: false, color: '#8b5cf6' },
];

const activeAlerts = [
  { id: 1, type: 'traffic', location: 'Đường Lê Duẩn', severity: 'high', message: 'Kẹt xe nghiêm trọng > 25p' },
  { id: 2, type: 'environment', location: 'Quận 2', severity: 'medium', message: 'Chất lượng KK trung bình' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminMapManagement() {
  const [mapLayers, setMapLayers] = useState(mapLayersInitial);
  const [selectedLayerType, setSelectedLayerType] = useState<string | null>(null);

  // 🎯 LOGIC QUAN TRỌNG: Lọc các entities dựa trên layer đang bật
  const visibleEntities = useMemo(() => {
    const activeTypes = mapLayers.filter(l => l.visible).map(l => l.type);
    return mockMapEntities.filter(e => activeTypes.includes(e.type));
  }, [mapLayers]);

  // Hàm toggle bật/tắt layer
  const toggleLayer = (type: string) => {
    setMapLayers(prev => prev.map(layer => 
        layer.type === type ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center !rounded-full bg-gray-100 p-1 gap-1 w-full max-w-md">
          <TabsTrigger value="map" className="flex-1 !rounded-full text-sm data-[state=active]:text-neutral-950 text-gray-600">Bản đồ</TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 !rounded-full text-sm data-[state=active]:text-neutral-950 text-gray-600">Lớp dữ liệu</TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1 !rounded-full text-sm data-[state=active]:text-neutral-950 text-gray-600">Cảnh báo</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Bản đồ */}
            <div className="lg:col-span-2 bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <div className="mb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-neutral-950">Bản đồ quản lý</h3>
                    <p className="text-sm text-gray-500">Giám sát hạ tầng thời gian thực</p>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border">
                    Đang hiển thị: {visibleEntities.length} đối tượng
                </div>
              </div>
              
              {/* Container chứa RealMap */}
              <div className="relative rounded-[14px] overflow-hidden border border-black/5" style={{ height: '500px' }}>
                <RealMap 
                    entities={visibleEntities} 
                    zoom={14}
                    center={[10.7750, 106.7000]} // Center tổng quan khu vực Q1
                />

                {/* Overlay thống kê nhanh */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-[10px] shadow-lg p-3 z-[1000]" style={cardStyle}>
                   <p className="text-xs font-medium text-neutral-950 mb-2">Trạng thái:</p>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"></div><span className="text-xs text-gray-700">Giao thông: Ổn định</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-600 rounded-full"></div><span className="text-xs text-gray-700">Môi trường: Tốt</span></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Danh sách Layer */}
            <div className="space-y-4">
              <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
                <h3 className="text-base font-medium text-neutral-950 mb-4">Lớp dữ liệu (Bật/Tắt)</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {mapLayers.map((layer) => (
                    <div 
                        key={layer.type} 
                        className="flex items-center justify-between p-3 bg-gray-50/50 rounded-[10px] cursor-pointer hover:bg-gray-100 transition-colors" 
                        style={cardStyle}
                        onClick={() => toggleLayer(layer.type)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: layer.color }}></div>
                        <span className={`text-sm ${layer.visible ? 'text-neutral-900 font-medium' : 'text-gray-400'}`}>{layer.name}</span>
                      </div>
                      <Badge 
                        variant={layer.visible ? 'default' : 'outline'} 
                        className={`shadow-none ${layer.visible ? 'bg-neutral-900 text-white' : 'text-gray-400 border-gray-200 bg-transparent'}`}
                      >
                        {layer.visible ? 'Bật' : 'Tắt'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layers">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <h3 className="text-lg font-medium text-neutral-950 mb-4">Quản lý chi tiết lớp dữ liệu</h3>
              <div className="space-y-3">
                {mapLayers.map((layer) => (
                  <div key={layer.type} className={`p-4 rounded-[14px] cursor-pointer hover:shadow-md transition-all ${selectedLayerType === layer.type ? 'bg-blue-50 border-blue-200' : 'bg-white'}`} style={selectedLayerType === layer.type ? { border: '0.8px solid #bfdbfe' } : cardStyle} onClick={() => setSelectedLayerType(layer.type)}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                            {/* Render icon động dựa trên type */}
                            {layer.type === 'TrafficCamera' ? <Camera className="w-5 h-5 text-gray-600"/> : 
                             layer.type === 'Telecom' ? <RadioTower className="w-5 h-5 text-gray-600"/> :
                             layer.type === 'AirQuality' ? <Wifi className="w-5 h-5 text-gray-600"/> :
                             <Layers className="w-5 h-5 text-gray-600"/>}
                          </div>
                          <div>
                              <p className="text-sm font-medium text-neutral-950">{layer.name}</p>
                              <p className="text-xs text-gray-500">{layer.type} • {layer.count} objects</p>
                          </div>
                       </div>
                       <div className='flex gap-2 items-center'>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: layer.color }}></div>
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleLayer(layer.type); }}>
                                {layer.visible ? 'Ẩn lớp này' : 'Hiện lớp này'}
                            </Button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="alerts">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <h3 className="text-lg font-medium text-neutral-950 mb-4">Cảnh báo đang hoạt động</h3>
              <div className="space-y-3">
                 {activeAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-gray-50/50 rounded-[14px]" style={cardStyle}>
                       <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                             <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                             <div><p className="text-sm font-medium text-neutral-950">{alert.message}</p><p className="text-xs text-gray-500">{alert.location}</p></div>
                          </div>
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="shadow-none">{alert.severity === 'high' ? 'Cao' : 'TB'}</Badge>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}