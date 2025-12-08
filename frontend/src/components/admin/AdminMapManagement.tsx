/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '../ui/badge'; 
import { Button } from '../ui/button'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'; 
import { 
  Layers, Loader2, X, MapPin, Thermometer, Wind, Droplets, CloudRain, 
  Car, AlertTriangle, Phone, Image as ImageIcon, Info, Activity,
  CloudFog, Calendar
} from 'lucide-react';

const RealMap = dynamic(() => import('../maps/RealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-[14px]">
      <Loader2 className="w-8 h-8 animate-spin mr-2" />
      Đang tải bản đồ...
    </div>
  )
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Cấu hình Layer
const mapLayersInitial = [
  { name: 'Thời tiết', type: 'Weather', visible: true, color: '#f97316', apiDomain: 'weather', isNgsi: true },
  { name: 'Cảm biến không khí', type: 'AirQuality', visible: true, color: '#10b981', apiDomain: 'air', isNgsi: true },
  { name: 'Bến xe buýt', type: 'BusStop', visible: true, color: '#3b82f6', apiDomain: 'bus', isNgsi: true },
  { name: 'Bãi đỗ xe', type: 'Parking', visible: true, color: '#f59e0b', apiDomain: 'parking', isNgsi: true },
  { name: 'Phản ánh sự cố', type: 'Report', visible: true, color: '#dc2626', apiDomain: 'reports/admin/all', isNgsi: false },
  { name: 'Nguồn dữ liệu', type: 'Source', visible: false, color: '#9333ea', apiDomain: 'sources', isNgsi: false },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminMapManagement() {
  const [mapLayers, setMapLayers] = useState(mapLayersInitial);
  const [selectedLayerType, setSelectedLayerType] = useState<string | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  // Helper an toàn để lấy value từ NGSI-LD Property
  const getVal = (prop: any) => {
    if (prop === undefined || prop === null) return undefined;
    if (typeof prop === 'object' && prop.value !== undefined) return prop.value;
    return prop;
  };

  useEffect(() => {
    const fetchEntities = async () => {
        try {
            const promises = mapLayers.map(async (layer) => {
                const url = layer.isNgsi 
                    ? `${API_URL}/${layer.apiDomain}/status` 
                    : `${API_URL}/${layer.apiDomain}`;

                const res = await fetch(url);
                if (!res.ok) return [];
                
                const rawData = await res.json();
                const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);
                
                return dataList.map((item: any) => {
                    // --- XỬ LÝ TỌA ĐỘ CHÍNH XÁC ---
                    let coords: [number, number] | null = null;

                    if (layer.isNgsi) {
                        // NGSI-LD: [lon, lat] -> Leaflet cần [lat, lon]
                        const locVal = item.location?.value?.coordinates || item.location?.coordinates;
                        if (Array.isArray(locVal) && locVal.length === 2) {
                            coords = [parseFloat(locVal[1]), parseFloat(locVal[0])];
                        }
                    } else if (layer.type === 'Report') {
                         // Reports API: lat, lng
                         if (item.lat && item.lng) coords = [parseFloat(item.lat), parseFloat(item.lng)];
                    } else if (layer.type === 'Source') {
                         // Sources API: latitude, longitude
                         if (item.latitude && item.longitude) coords = [parseFloat(item.latitude), parseFloat(item.longitude)];
                    }

                    // Nếu không có tọa độ, bỏ qua hoặc dùng mặc định
                    if (!coords) return null; 

                    return {
                        id: item.id || `entity-${Math.random()}`,
                        type: layer.type,
                        location: coords,
                        // Tên hiển thị: ưu tiên name.value -> title -> name -> ID rút gọn
                        name: getVal(item.name) || item.title || item.name || item.id.split(':').pop(),
                        
                        // Dữ liệu chi tiết
                        temperature: getVal(item.temperature), 
                        humidity: getVal(item.humidity) || getVal(item.relativeHumidity),
                        windSpeed: getVal(item.windSpeed),
                        precipitation: getVal(item.precipitation) || getVal(item.rain),

                        // Chuẩn hóa AQI và các chất ô nhiễm
                        airQualityIndex: getVal(item.airQualityIndex), 
                        pm25: getVal(item.pm25),
                        pm10: getVal(item.pm10),
                        no2: getVal(item.no2),
                        co: getVal(item.co),
                        so2: getVal(item.so2),

                        availableSpotNumber: getVal(item.availableSpotNumber),
                        totalSpotNumber: getVal(item.totalSpotNumber),

                        status: item.status, 
                        description: item.description,
                        phoneNumber: item.phoneNumber,
                        imageUrl: item.images?.[0] || item.imageUrl,
                        createdAt: item.createdAt,

                        adapterType: item.adapterType,
                        isActive: item.isActive,

                        address: getVal(item.address) || item.address,
                    };
                });
            });

            const results = await Promise.all(promises);
            // Lọc bỏ các entity null (không có tọa độ)
            const flatResults = results.flat().filter(e => e !== null);
            setEntities(flatResults);
        } catch (e) {
            console.error("Lỗi tải map entities:", e);
        }
    };
    fetchEntities();
  }, []);

  const visibleEntities = useMemo(() => {
    const activeTypes = mapLayers.filter(l => l.visible).map(l => l.type);
    return entities.filter(e => activeTypes.includes(e.type));
  }, [mapLayers, entities]);

  const toggleLayer = (type: string) => {
    setMapLayers(prev => prev.map(layer => 
        layer.type === type ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Helper đánh giá chất lượng không khí
  const getAqiInfo = (aqi: number) => {
      if (!aqi) return { text: 'Không xác định', color: 'bg-gray-100 text-gray-600', gradient: 'from-gray-100 to-gray-200' };
      if (aqi === 1) return { text: 'Tốt', color: 'bg-green-100 text-green-700', gradient: 'from-green-400 to-emerald-600' };
      if (aqi === 2) return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-700', gradient: 'from-yellow-400 to-amber-500' };
      if (aqi === 3) return { text: 'Kém', color: 'bg-orange-100 text-orange-700', gradient: 'from-orange-400 to-red-500' };
      if (aqi >= 4) return { text: 'Xấu', color: 'bg-red-100 text-red-700', gradient: 'from-red-500 to-rose-700' };
      return { text: 'N/A', color: 'bg-gray-100', gradient: 'from-gray-400 to-gray-500' };
  };

  // --- RENDER INFO CARD ---
  const renderEntityDetails = () => {
    if (!selectedEntity) return null;

    const type = selectedEntity.type;
    const aqiInfo = getAqiInfo(selectedEntity.airQualityIndex);

    return (
      // UPDATE: Đã xóa border và border-gray-100 ở thẻ div ngoài cùng
      <div className="bg-white rounded-[14px] animate-in fade-in slide-in-from-right-4 overflow-hidden">
        
        {/* UPDATE: Đã xóa border-b và border-gray-100 ở header */}
        <div className="p-4 bg-gray-50/50 flex justify-between items-start">
          <div className="pr-4">
            <h4 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
              {selectedEntity.name}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="rounded-md px-2 py-0 text-[10px] font-medium uppercase tracking-wider bg-white border border-gray-200 shadow-sm">
                {type}
              </Badge>
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={selectedEntity.id}>
                {selectedEntity.id.replace('urn:ngsi-ld:', '')}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedEntity(null)} 
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
            {/* Vị trí */}
            <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-slate-50 px-3 py-2.5 rounded-[10px] border border-slate-100">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium truncate">
                    {typeof selectedEntity.address === 'string' ? selectedEntity.address : 
                     selectedEntity.address?.value?.addressLocality || 
                     `${selectedEntity.location[0].toFixed(5)}, ${selectedEntity.location[1].toFixed(5)}`}
                </span>
            </div>

            {/* --- NỘI DUNG RIÊNG TỪNG LOẠI --- */}

            {/* A. THỜI TIẾT */}
            {type === 'Weather' && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-50 rounded-[12px] flex flex-col items-center justify-center border border-orange-100/50">
                        <Thermometer className="w-6 h-6 text-orange-500 mb-1" />
                        <span className="text-xs text-orange-600/80 font-medium">Nhiệt độ</span>
                        <span className="text-xl font-bold text-orange-700">{selectedEntity.temperature ?? '--'}°C</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-[12px] flex flex-col items-center justify-center border border-blue-100/50">
                        <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="text-xs text-blue-600/80 font-medium">Độ ẩm</span>
                        <span className="text-xl font-bold text-blue-700">{selectedEntity.humidity ?? '--'}%</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-[12px] flex flex-col items-center justify-center border border-emerald-100/50">
                        <Wind className="w-6 h-6 text-emerald-500 mb-1" />
                        <span className="text-xs text-emerald-600/80 font-medium">Gió</span>
                        <span className="text-lg font-bold text-emerald-700">{selectedEntity.windSpeed ?? '--'} m/s</span>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-[12px] flex flex-col items-center justify-center border border-indigo-100/50">
                        <CloudRain className="w-6 h-6 text-indigo-500 mb-1" />
                        <span className="text-xs text-indigo-600/80 font-medium">Mưa</span>
                        <span className="text-lg font-bold text-indigo-700">{selectedEntity.precipitation ?? 0} mm</span>
                    </div>
                </div>
            )}

            {/* B. KHÔNG KHÍ */}
            {type === 'AirQuality' && (
                <div className="space-y-4">
                    {/* AQI Score Main */}
                    <div className={`relative overflow-hidden rounded-[14px] p-5 text-white bg-gradient-to-br ${aqiInfo.gradient}`}>
                        <CloudFog className="absolute right-[-10px] top-[-10px] text-white/20 w-24 h-24 rotate-12" />
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">Chỉ số AQI</p>
                                <p className="text-4xl font-extrabold tracking-tight">{selectedEntity.airQualityIndex ?? '--'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold">{aqiInfo.text}</p>
                                <p className="text-xs text-white/80">Chất lượng không khí</p>
                            </div>
                        </div>
                    </div>

                    {/* Pollutants Grid */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">Các chỉ số ô nhiễm</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'PM2.5', value: selectedEntity.pm25, unit: 'µg/m³' },
                                { label: 'PM10', value: selectedEntity.pm10, unit: 'µg/m³' },
                                { label: 'CO', value: selectedEntity.co, unit: 'µg/m³' },
                                { label: 'NO2', value: selectedEntity.no2, unit: 'µg/m³' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50/80 rounded-[10px] border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-gray-900">{item.value ? Number(item.value).toFixed(1) : '--'}</span>
                                        <span className="text-[10px] text-gray-400 leading-none">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* C. BÃI ĐỖ XE */}
            {type === 'Parking' && (
                <div className="p-4 bg-white border border-blue-100 rounded-[14px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-full">
                            <Car className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Tình trạng bãi đỗ</p>
                            <p className="text-xs text-gray-500">Cập nhật theo thời gian thực</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between border-t border-dashed border-gray-200 pt-3">
                        <div>
                            <p className="text-3xl font-bold text-blue-600">{selectedEntity.availableSpotNumber ?? 0}</p>
                            <p className="text-xs text-blue-600/80 font-medium">Chỗ trống</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold text-gray-600">/ {selectedEntity.totalSpotNumber ?? '--'}</p>
                            <p className="text-xs text-gray-400">Tổng sức chứa</p>
                        </div>
                    </div>
                </div>
            )}

            {/* D. BÁO CÁO SỰ CỐ */}
            {type === 'Report' && (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge className={`px-2.5 py-1 ${
                            selectedEntity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' : 
                            selectedEntity.status === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 
                            'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                        }`}>
                            {selectedEntity.status === 'PENDING' ? 'Chờ xử lý' : selectedEntity.status}
                        </Badge>
                        {selectedEntity.createdAt && (
                            <Badge variant="outline" className="flex items-center gap-1 text-gray-500 font-normal bg-gray-50">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedEntity.createdAt).toLocaleDateString('vi-VN')}
                            </Badge>
                        )}
                    </div>
                    
                    <div className="p-3.5 bg-red-50/50 rounded-[12px] border border-red-100 text-sm text-gray-800">
                        <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-xs uppercase tracking-wide">
                            <AlertTriangle className="w-4 h-4" /> Nội dung báo cáo
                        </div>
                        <p className="leading-relaxed">{selectedEntity.description}</p>
                    </div>

                    {selectedEntity.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 p-2.5 rounded-[10px]">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-mono">{selectedEntity.phoneNumber}</span>
                        </div>
                    )}

                    {selectedEntity.imageUrl && (
                        <div className="relative rounded-[12px] overflow-hidden border border-gray-200 aspect-video group cursor-pointer">
                            <img 
                                src={selectedEntity.imageUrl} 
                                alt="Report Evidence" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    )}
                </div>
            )}

             {/* E. NGUỒN DỮ LIỆU */}
             {type === 'Source' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-[14px] border border-gray-200">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Adapter</span>
                        <Badge variant="outline" className="bg-white font-mono text-xs">{selectedEntity.adapterType}</Badge>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Trạng thái</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedEntity.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className={`text-sm font-bold ${selectedEntity.isActive ? "text-green-700" : "text-red-700"}`}>
                                {selectedEntity.isActive ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
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
              
              <div className="relative z-0 rounded-[14px] overflow-hidden border border-gray-200" style={{ height: '500px' }}>
                <RealMap 
                    domain="admin"
                    searchTerm=""
                    entities={visibleEntities} 
                    zoom={14}
                    center={[10.7750, 106.7000]}
                    onSelectEntity={(entity) => setSelectedEntity(entity)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Card thông tin chi tiết */}
              {selectedEntity && renderEntityDetails()}

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
                  <div 
                    key={layer.type} 
                    className={`p-4 rounded-[14px] cursor-pointer hover:shadow-md transition-all ${selectedLayerType === layer.type ? 'bg-blue-50 border-blue-200' : 'bg-white'}`} 
                    style={selectedLayerType === layer.type ? { border: '0.8px solid #bfdbfe' } : cardStyle} 
                    onClick={() => setSelectedLayerType(layer.type)}
                  >
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
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => { e.stopPropagation(); toggleLayer(layer.type); }}
                            >
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