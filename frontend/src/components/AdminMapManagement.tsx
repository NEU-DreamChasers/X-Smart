'use client';

import { useState, useMemo, useEffect } from 'react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Cấu hình layers + mapping API domain
const mapLayersInitial = [
  { name: 'Bến xe buýt', type: 'BusStop', visible: true, color: '#3b82f6', apiDomain: 'bus' },
  { name: 'Cảm biến không khí', type: 'AirQuality', visible: true, color: '#10b981', apiDomain: 'air' },
  { name: 'Bãi đỗ xe', type: 'Parking', visible: true, color: '#f59e0b', apiDomain: 'parking' },
  // { name: 'Thời tiết', type: 'Weather', visible: false, color: '#ef4444', apiDomain: 'weather' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminMapManagement() {
  const [mapLayers, setMapLayers] = useState(mapLayersInitial);
  const [selectedLayerType, setSelectedLayerType] = useState<string | null>(null);
  const [entities, setEntities] = useState<any[]>([]);

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchEntities = async () => {
        try {
            const promises = mapLayers.map(async (layer) => {
                // Gọi API /api/:domain/status
                const res = await fetch(`${API_URL}/${layer.apiDomain}/status`);
                if (!res.ok) return [];
                const data = await res.json();
                
                // Map dữ liệu NGSI-LD sang format của Map
                return data.map((item: any) => ({
                    id: item.id,
                    type: layer.type,
                    // NGSI-LD GeoJSON là [Lon, Lat], Leaflet cần [Lat, Lon]
                    location: item.location?.value?.coordinates 
                        ? [item.location.value.coordinates[1], item.location.value.coordinates[0]]
                        : [10.7750, 106.7000],
                    name: item.name?.value || item.id,
                    status: 'active'
                }));
            });

            const results = await Promise.all(promises);
            setEntities(results.flat());
        } catch (e) {
            console.error("Lỗi tải map entities:", e);
        }
    };
    fetchEntities();
  }, []);

  // Lọc entities theo layer
  const visibleEntities = useMemo(() => {
    const activeTypes = mapLayers.filter(l => l.visible).map(l => l.type);
    return entities.filter(e => activeTypes.includes(e.type));
  }, [mapLayers, entities]);

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
        </TabsList>

        <TabsContent value="map">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <div className="mb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-neutral-950">Bản đồ quản lý</h3>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border">
                    Đang hiển thị: {visibleEntities.length} đối tượng
                </div>
              </div>
              
              <div className="relative rounded-[14px] overflow-hidden border border-black/5" style={{ height: '500px' }}>
                <RealMap 
                    entities={visibleEntities} 
                    zoom={14}
                    center={[10.7750, 106.7000]} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
                <h3 className="text-base font-medium text-neutral-950 mb-4">Lớp dữ liệu</h3>
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
                             <Layers className="w-5 h-5 text-gray-600"/>
                          </div>
                          <div>
                              <p className="text-sm font-medium text-neutral-950">{layer.name}</p>
                              <p className="text-xs text-gray-500">{layer.type}</p>
                          </div>
                       </div>
                       <div className='flex gap-2 items-center'>
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
      </Tabs>
    </div>
  );
}