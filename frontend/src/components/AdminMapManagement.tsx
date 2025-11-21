'use client';

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Layers, Settings, MapPin, AlertTriangle } from 'lucide-react';

const mapLayers = [
  { name: 'Bến xe buýt', type: 'BusStop', count: 389, visible: true, color: '#3b82f6' },
  { name: 'Cảm biến không khí', type: 'AirQuality', count: 245, visible: true, color: '#10b981' },
  { name: 'Bãi đỗ xe', type: 'Parking', count: 567, visible: true, color: '#f59e0b' },
];

const activeAlerts = [
  { id: 1, type: 'traffic', location: 'Đường Lê Duẩn', severity: 'high', message: 'Kẹt xe nghiêm trọng' },
  { id: 2, type: 'environment', location: 'Quận 2', severity: 'medium', message: 'Chất lượng KK trung bình' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminMapManagement() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

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
            <div className="lg:col-span-2 bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-neutral-950">Bản đồ quản lý</h3>
                <p className="text-sm text-gray-500">OpenStreetMap với NGSI-LD overlay</p>
              </div>
              <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-[14px] overflow-hidden" style={{ height: '500px', ...cardStyle }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Map Placeholder</div>
                {/* Stats overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-[10px] shadow-lg p-3" style={cardStyle}>
                   <p className="text-xs font-medium text-neutral-950 mb-2">Thống kê:</p>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"></div><span className="text-xs text-gray-700">Giao thông: 389</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-600 rounded-full"></div><span className="text-xs text-gray-700">Môi trường: 245</span></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
                <h3 className="text-base font-medium text-neutral-950 mb-4">Lớp đang hiển thị</h3>
                <div className="space-y-2">
                  {mapLayers.map((layer) => (
                    <div key={layer.type} className="flex items-center justify-between p-2 bg-gray-50/50 rounded-[10px]" style={cardStyle}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }}></div>
                        <span className="text-sm text-neutral-900">{layer.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-white text-neutral-950 shadow-none" style={cardStyle}>{layer.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layers">
           {/* Simplified for brevity */}
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <h3 className="text-lg font-medium text-neutral-950 mb-4">Quản lý lớp dữ liệu</h3>
              <div className="space-y-3">
                {mapLayers.map((layer) => (
                  <div key={layer.type} className={`p-4 rounded-[14px] cursor-pointer hover:shadow-md transition-all ${selectedLayer === layer.type ? 'bg-blue-50 border-blue-200' : 'bg-white'}`} style={selectedLayer === layer.type ? { border: '0.8px solid #bfdbfe' } : cardStyle} onClick={() => setSelectedLayer(layer.type)}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"><Layers className="w-4 h-4 text-gray-600"/></div>
                          <div><p className="text-sm font-medium text-neutral-950">{layer.name}</p><p className="text-xs text-gray-500">{layer.type}</p></div>
                       </div>
                       <Badge variant="default" className="bg-neutral-900 text-white hover:bg-neutral-800">Hiển thị</Badge>
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