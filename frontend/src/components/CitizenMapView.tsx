/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from './ui/badge';
import { 
  Bus, Hospital, School, MapPin, Search, Filter, 
  Map, Activity, X, Loader2, Navigation, Clock, Compass, CornerUpRight,
  Car,
  Wind,
  CloudSun, Droplets, Thermometer, Gauge, CloudFog, AlertTriangle, Biohazard, Sun, CloudRain
} from 'lucide-react';

// Import Interface để type checking (nếu cần)
import type { NgsiEntity } from './maps/RealMap';
import { formatAddress } from '@/lib/utils';

// Import Map động (No SSR)
const RealMap = dynamic(() => import('./maps/RealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 animate-pulse flex flex-col items-center justify-center gap-3 text-gray-400 rounded-[14px]">
       <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
       <span className="text-sm font-medium">Đang tải bản đồ thành phố...</span>
    </div>
  )
});


const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

// Helper: Lấy giá trị an toàn từ NGSI-LD Object
  const getVal = (prop: any) => {
    if (prop?.value !== undefined) return prop.value;
    return prop ?? 0;
  };

  // Helper: Dịch tên thời tiết
  const translateWeather = (typeObj: any) => {
    const type = typeObj?.value || typeObj || '';
    const map: Record<string, string> = {
        'Clear': 'Quang đãng', 'Clouds': 'Có mây', 'Rain': 'Mưa',
        'Drizzle': 'Mưa phùn', 'Thunderstorm': 'Dông bão', 'Mist': 'Sương mù', 'clear sky': 'Quang đãng'
    };
    return map[type] || type || 'Bình thường';
  };

// Hook Debounce: Giúp search mượt hơn, không gọi API liên tục
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- HÀM HELPER: ƯU TIÊN HIỂN THỊ TÊN ĐỊA DANH ---
const getDisplayName = (item: any) => {
  // 1. Nếu có tên chính thức (name), dùng nó
  if (item.name) return item.name;

  // 2. Nếu không, quét qua các trường địa danh phổ biến
  const candidates = [
    item.address?.amenity,   
    item.address?.building,  
    item.address?.leisure,     
    item.address?.tourism,     
    item.address?.shop,       
    item.address?.office,       
    item.address?.university, 
    item.address?.school,
    item.address?.hospital
  ];

  // Lấy cái đầu tiên không null/undefined
  const landmarkName = candidates.find(c => c);
  if (landmarkName) return landmarkName;

  // 3. Cuối cùng mới dùng số nhà + tên đường
  if (item.address?.road) {
    return `${item.address.house_number ? item.address.house_number + ' ' : ''}${item.address.road}`;
  }

  // 4. Fallback cuối cùng
  return item.display_name.split(',')[0];
};

export function CitizenMapView() {
  // State Search
  const [searchQuery, setSearchQuery] = useState(''); 
  const debouncedQuery = useDebounce(searchQuery, 500); 
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State Map Logic
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7721, 106.6983]); 
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  
  // State Filter & Realtime Data
  const [layerDomain, setLayerDomain] = useState<string>('weather');
  const [markerFilter, setMarkerFilter] = useState('');
  const [realEntityCount, setRealEntityCount] = useState(0);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // State Routing & Selection
  const [selectedRealEntity, setSelectedRealEntity] = useState<NgsiEntity | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ start: [number, number], end: [number, number] } | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // --- EFFECT: GỌI API NOMINATIM ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        // viewbox cho khu vực TP.HCM
        const viewbox = '106.3,11.2,107.0,10.3';
        // addressdetails=1 để lấy chi tiết (amenity, road...) phục vụ getDisplayName
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&countrycodes=vn&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // --- HANDLER: CHỌN GỢI Ý ---
  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    setMapCenter([lat, lon]);      
    setSearchMarker([lat, lon]);   
    
    // Cập nhật text input bằng tên hiển thị đẹp
    setSearchQuery(getDisplayName(item));
    
    setShowSuggestions(false);
    
    // Tạo một entity giả lập để Sidebar hiển thị thông tin
    const fakeEntity: any = {
      id: 'search:result',
      type: 'SearchResult',
      name: { value: getDisplayName(item) },
      location: { value: { coordinates: [lon, lat] } }, // GeoJSON: [Lon, Lat]
      address: { value: { streetAddress: item.display_name } }
    };
    setSelectedRealEntity(fakeEntity);
    setRouteCoords(null);
  };

  // Ẩn danh sách khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMapDataStatus = (count: number, loading: boolean) => {
    setRealEntityCount(count);
    setIsMapLoading(loading);
  };

  const handleEntityClick = (entity: NgsiEntity) => {
    setSelectedRealEntity(entity);
    setRouteCoords(null);
  };

  // --- LOGIC CHỈ ĐƯỜNG ---
  const startNavigation = () => {
    if (!selectedRealEntity?.location?.value?.coordinates) return;
    setIsRoutingLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const start: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const [lng, lat] = selectedRealEntity.location!.value.coordinates;
        setRouteCoords({ start, end: [lat, lng] });
        setMapCenter(start);
        setIsRoutingLoading(false);
      },
      (err) => {
        alert("Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng chỉ đường.");
        setIsRoutingLoading(false);
      }
    );
  };

  const getEntityName = () => {
    if (!selectedRealEntity) return '';
    return selectedRealEntity.name?.value || selectedRealEntity.id.split(':').pop() || 'Địa điểm đã chọn';
  };

  return (
    <div className="space-y-6">
      
      {/* --- THANH TÌM KIẾM THÔNG MINH --- */}
      <div className="bg-white rounded-[14px] p-4 shadow-sm relative z-[1001]" style={borderStyle} ref={searchContainerRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm địa điểm (VD: Đại học Bách Khoa)..." 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="w-full pl-10 pr-10 py-2 rounded-[10px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all text-sm"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchMarker(null); setSuggestions([]); setSelectedRealEntity(null); }}>
                    <X className="w-4 h-4 hover:text-red-500 transition-colors" />
                  </button>
                )
              }
            </div>

            {/* --- DROPDOWN GỢI Ý --- */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-lg border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-full shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {getDisplayName(item)}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {item.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: BẢN ĐỒ */}
        <div className="lg:col-span-2 bg-white rounded-[14px] p-1 shadow-sm flex flex-col h-[650px]" style={borderStyle}>
          
          {/* Map Controls */}
          <div className="p-4 flex flex-col xl:flex-row gap-3 justify-between items-center">
            <div className="flex gap-3 w-full xl:w-auto">
              <select
                value={layerDomain}
                onChange={(e) => { setLayerDomain(e.target.value); setMarkerFilter(''); }}
                className="pl-3 pr-8 py-2 bg-gray-50 rounded-[10px] text-sm font-medium border-transparent focus:ring-0 cursor-pointer outline-none"
              >
                <option value="weather">⛈️ Thời tiết</option>
                <option value="air">🌫 Không khí</option>
                <option value="parking">🅿️ Bãi đỗ xe</option>
                <option value="bus">🚌 Trạm Bus</option>
              </select>
              <input 
                type="text"
                placeholder={`Lọc trong lớp ${layerDomain}...`}
                value={markerFilter}
                onChange={(e) => setMarkerFilter(e.target.value)}
                className="pl-3 pr-3 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none w-full"
              />
            </div>
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border ${isMapLoading ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {isMapLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
              {isMapLoading ? 'Đang tải...' : `${realEntityCount} điểm hoạt động`}
            </div>
          </div>
          
          <div className="flex-1 relative w-full overflow-hidden bg-gray-50 rounded-b-[14px] z-0">
            <RealMap 
              domain={layerDomain}      
              searchTerm={markerFilter} 
              onDataLoaded={handleMapDataStatus}
              center={mapCenter}
              searchMarker={searchMarker}
              routeCoordinates={routeCoords}
              onSelectEntity={handleEntityClick}
            />
          </div>
        </div>

        {/* CỘT PHẢI: SIDEBAR THÔNG MINH */}
        <div className="space-y-4 h-[650px] flex flex-col">
          <div className="bg-white rounded-[14px] p-5 shadow-sm flex-1 flex flex-col overflow-hidden relative" style={borderStyle}>
            
            {/* TRẠNG THÁI 1: ĐÃ CHỌN ĐỊA ĐIỂM */}
            {selectedRealEntity ? (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                {/* Header & Back Button */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <button 
                    onClick={() => { setSelectedRealEntity(null); setRouteCoords(null); }}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-900 mb-2 transition-colors"
                  >
                    <CornerUpRight className="w-3 h-3 rotate-180" /> Quay lại danh sách
                  </button>
                  
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {getEntityName()}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" /> 
                    <span className="line-clamp-3 italic">
                      {/* Hàm formatAddress đã có ở ngoài */}
                      {formatAddress(selectedRealEntity.address?.value?.streetAddress || selectedRealEntity.address?.value || selectedRealEntity.address)}
                    </span>
                  </p>
                </div>

                {/* PHÂN LOẠI GIAO DIỆN: THỜI TIẾT vs ĐỊA ĐIỂM KHÁC */}
                {(() => {
                  const isWeather = selectedRealEntity.type?.includes('Weather') || selectedRealEntity.temperature?.value !== undefined;
                  const isAir = selectedRealEntity.type?.includes('Air') || selectedRealEntity.airQualityIndex !== undefined;

                  if (isWeather) {
                    // --- LOGIC MÀU THEO NHIỆT ĐỘ ---
                    const temp = selectedRealEntity.temperature?.value ?? 25;
                    const getTempColors = (temperature: number) => {
                      if (temperature >= 35) return { gradient: 'from-red-500 to-orange-600', shadow: 'shadow-red-200', text: 'text-red-100', icon: '🔥' };
                      if (temperature >= 30) return { gradient: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-200', text: 'text-orange-100', icon: '☀️' };
                      if (temperature >= 25) return { gradient: 'from-yellow-400 to-orange-400', shadow: 'shadow-yellow-200', text: 'text-yellow-100', icon: '🌤️' };
                      if (temperature >= 20) return { gradient: 'from-green-400 to-teal-500', shadow: 'shadow-green-200', text: 'text-green-100', icon: '🌿' };
                      if (temperature >= 15) return { gradient: 'from-blue-400 to-cyan-500', shadow: 'shadow-blue-200', text: 'text-blue-100', icon: '❄️' };
                      return { gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-200', text: 'text-indigo-100', icon: '🧊' };
                    };
                    const tempColors = getTempColors(temp);
                    
                    // --- GIAO DIỆN THỜI TIẾT ---
                    return (
                      <div className="space-y-4">
                        {/* 1. Thẻ Nhiệt độ chính */}
                        <div className={`bg-gradient-to-br ${tempColors.gradient} rounded-2xl p-6 text-white shadow-lg ${tempColors.shadow} relative overflow-hidden`}>
                          <div className="absolute top-[-20px] right-[-20px] opacity-20">
                            <CloudSun size={120} />
                          </div>
                          <div className="relative z-10">
                            <p className={`${tempColors.text} text-sm font-medium uppercase tracking-wider flex items-center gap-2`}>
                              <span>{tempColors.icon}</span> Nhiệt độ hiện tại
                            </p>
                            <div className="flex items-end gap-2 mt-1">
                              <span className="text-6xl font-bold tracking-tighter">
                                {selectedRealEntity.temperature?.value ?? '--'}
                              </span>
                              <span className="text-3xl font-medium mb-2">°C</span>
                            </div>
                            <p className="mt-2 text-white/90 flex items-center gap-2 text-xs">
                              <Activity className="w-4 h-4" /> 
                              Cập nhật: {selectedRealEntity.dateObserved?.value ? new Date(selectedRealEntity.dateObserved.value).toLocaleTimeString() : 'Vừa xong'}
                            </p>
                          </div>
                        </div>

                        {/* 2. Lưới thông tin chi tiết */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Droplets className="w-5 h-5" />
                              <span className="text-sm font-bold">Độ ẩm</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">
                              {selectedRealEntity.humidity?.value ?? selectedRealEntity.relativeHumidity?.value ?? '--'}%
                            </p>
                          </div>

                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                              <Wind className="w-5 h-5" />
                              <span className="text-sm font-bold">Gió</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">
                              {selectedRealEntity.windSpeed?.value ?? '--'} <span className="text-sm font-normal text-gray-500">m/s</span>
                            </p>
                          </div>
                          
                          {selectedRealEntity.rain?.value !== undefined && (
                             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 col-span-2">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                  <CloudSun className="w-5 h-5" />
                                  <span className="text-sm font-bold">Lượng mưa (1h)</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">
                                  {selectedRealEntity.rain.value} <span className="text-sm font-normal text-gray-500">mm</span>
                                </p>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  } 
                  
                  else if (isAir) {
                    const aqi = selectedRealEntity.airQualityIndex?.value ?? selectedRealEntity.airQualityIndex ?? 1;
                    
                    // Chọn màu và lời khuyên theo AQI (1-5)
                    const getAqiStatus = (val: number) => {
                      if (val === 1) return { color: 'from-emerald-400 to-green-600', text: 'Tốt', advice: 'Không khí trong lành, tuyệt vời cho hoạt động ngoài trời.', icon: '🌿' };
                      if (val === 2) return { color: 'from-yellow-400 to-orange-500', text: 'Trung bình', advice: 'Chất lượng chấp nhận được. Nhóm nhạy cảm nên hạn chế.', icon: '😐' };
                      if (val === 3) return { color: 'from-orange-500 to-red-500', text: 'Kém', advice: 'Người già và trẻ em nên hạn chế ra ngoài.', icon: '😷' };
                      if (val === 4) return { color: 'from-red-600 to-rose-700', text: 'Xấu', advice: 'Cảnh báo: Có hại cho sức khỏe. Nên đeo khẩu trang.', icon: '🤢' };
                      return { color: 'from-purple-600 to-indigo-800', text: 'Nguy hại', advice: 'Khẩn cấp: Tránh mọi hoạt động ngoài trời!', icon: '☠️' };
                    };
                    
                    const status = getAqiStatus(aqi);

                    return (
                      <div className="space-y-4">
                        <div className={`bg-gradient-to-br ${status.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
                          <div className="absolute top-[-20px] right-[-20px] opacity-20">
                            <CloudFog size={120} />
                          </div>
                          <div className="relative z-10">
                             <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Chỉ số AQI</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-extrabold">{aqi}</span>
                                    <span className="text-2xl font-medium">/ 5</span>
                                  </div>
                                </div>
                                <span className="text-4xl">{status.icon}</span>
                             </div>
                             <div className="mt-2 pt-2 border-t border-white/20">
                                <p className="text-xl font-bold">{status.text}</p>
                                <p className="text-sm text-white/90 mt-1 flex gap-2">
                                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                  {status.advice}
                                </p>
                             </div>
                          </div>
                        </div>

                        {/* 2. Chi tiết các chất ô nhiễm */}
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-2">Thành phần ô nhiễm</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Bụi mịn PM2.5</p>
                            <p className="text-xl font-bold text-gray-800">
                              {selectedRealEntity.pm25?.value ?? selectedRealEntity.pm25 ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Bụi PM10</p>
                            <p className="text-xl font-bold text-gray-800">
                              {selectedRealEntity.pm10?.value ?? selectedRealEntity.pm10 ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Khí CO</p>
                            <p className="text-xl font-bold text-gray-800">
                              {selectedRealEntity.co?.value ?? selectedRealEntity.co ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Khí NO2</p>
                            <p className="text-xl font-bold text-gray-800">
                              {selectedRealEntity.no2?.value ?? selectedRealEntity.no2 ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // --- GIAO DIỆN ĐỊA ĐIỂM KHÁC (Parking, Bus...) ---
                  else {
                    return (
                      <>
                        <div className="bg-blue-50 rounded-[12px] p-4 mb-4 border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Navigation className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Điều hướng thông minh</p>
                              <p className="text-xs text-blue-600">
                                {routeCoords ? 'Đang dẫn đường...' : 'Sẵn sàng tính toán lộ trình'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto space-y-3">
                          {!routeCoords ? (
                            <button 
                              onClick={startNavigation}
                              disabled={isRoutingLoading}
                              className="w-full py-3 bg-gray-900 text-white rounded-[12px] font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-70"
                            >
                              {isRoutingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Compass className="w-5 h-5" />}
                              Bắt đầu chỉ đường
                            </button>
                          ) : (
                            <button 
                              onClick={() => setRouteCoords(null)}
                              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-[12px] font-medium hover:bg-gray-50 transition-all active:scale-95"
                            >
                              Hủy dẫn đường
                            </button>
                          )}
                        </div>
                      </>
                    );
                  }
                })()}
              </div>
            ) : (
              // TRẠNG THÁI 2: CHƯA CHỌN GÌ (LIST DEMO)
              <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
  
                {/* 1. CARD THỐNG KÊ REAL-TIME */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600" /> 
                    Trạng thái hệ thống
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-50">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Điểm giám sát</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {realEntityCount > 0 ? realEntityCount : '--'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-50">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Cập nhật</p>
                      <p className="text-lg font-bold text-green-600 mt-1">Real-time</p>
                      <p className="text-[10px] text-gray-400">Mỗi 30 giây</p>
                    </div>
                  </div>
                </div>

                {/* 2. BẢNG CHÚ GIẢI */}
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-y-auto">
                  <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                    <Map className="w-5 h-5 text-gray-600" /> 
                    Chú giải ký hiệu
                  </h3>
                  
                  <div className="space-y-3">
                    {/* 1. Trạm Thời tiết */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-[#f97316] border-2 border-white shadow-md flex items-center justify-center">
                        <CloudSun size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Trạm Thời tiết</p>
                        <p className="text-xs text-gray-500">Nhiệt độ, độ ẩm, gió</p>
                      </div>
                    </div>

                    {/* 2. Quan trắc Không khí */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-[#10b981] border-2 border-white shadow-md flex items-center justify-center">
                        <Wind size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Quan trắc Không khí</p>
                        <p className="text-xs text-gray-500">Chỉ số AQI, bụi PM2.5</p>
                      </div>
                    </div>

                    {/* 3. Bãi đỗ xe thông minh */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-[#2563eb] border-2 border-white shadow-md flex items-center justify-center">
                        <Car size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Bãi đỗ xe thông minh</p>
                        <p className="text-xs text-gray-500">Hiển thị số chỗ trống</p>
                      </div>
                    </div>

                    {/* 4. Trạm xe Buýt */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-[#4f46e5] border-2 border-white shadow-md flex items-center justify-center">
                        <Bus size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Trạm xe Buýt</p>
                        <p className="text-xs text-gray-500">Vị trí bến dừng, nhà chờ</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400 italic">
                      Dữ liệu được cung cấp bởi OpenStreetMap & OpenWeatherMap
                    </p>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}