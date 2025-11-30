'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from './ui/badge';
import { 
  Bus, Hospital, School, MapPin, Search, Filter, 
  Map, Activity, X, Loader2, Navigation, Clock, Compass, CornerUpRight
} from 'lucide-react';

// Import Interface để type checking (nếu cần)
import type { NgsiEntity } from './maps/RealMap';

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

// Dữ liệu mẫu Demo (Fallback khi chưa chọn gì)
const nearbyEntities = [
  { id: '001', type: 'BusStop', name: 'Bến xe Bến Thành', distance: 0.3, icon: Bus, color: 'text-blue-600', bgColor: 'bg-blue-50', location: [10.7721, 106.6983] },
  { id: '002', type: 'Hospital', name: 'Bệnh viện Chợ Rẫy', distance: 0.8, icon: Hospital, color: 'text-red-600', bgColor: 'bg-red-50', location: [10.7558, 106.6622] },
  { id: '003', type: 'School', name: 'THPT Lê Hồng Phong', distance: 1.2, icon: School, color: 'text-green-600', bgColor: 'bg-green-50', location: [10.7655, 106.6757] },
];

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

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
                      {/* Tên địa danh (In đậm) */}
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {getDisplayName(item)}
                      </p>
                      {/* Địa chỉ chi tiết (Nhạt hơn) */}
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
                <option value="traffic">🚦 Giao thông</option>
                <option value="parking">🅿️ Bãi đỗ xe</option>
                <option value="bus">🚌 Trạm Bus</option>
                <option value="poi">🏥 Tiện ích</option>
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
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <button 
                    onClick={() => { setSelectedRealEntity(null); setRouteCoords(null); }}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-900 mb-2 transition-colors"
                  >
                    <CornerUpRight className="w-3 h-3 rotate-180" /> Quay lại danh sách
                  </button>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">{getEntityName()}</h3>
                  <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" /> 
                    <span className="line-clamp-3">{selectedRealEntity.address?.value?.streetAddress || 'Đang cập nhật địa chỉ chi tiết'}</span>
                  </p>
                </div>

                {/* Info Box Routing */}
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

                {/* Routing Actions */}
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
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-100 rounded-[10px] text-sm text-green-800 flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Đường đi đã được vẽ trên bản đồ. Hãy đi theo đường màu xanh.</p>
                      </div>
                      <button 
                        onClick={() => setRouteCoords(null)}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-[12px] font-medium hover:bg-gray-50 transition-all active:scale-95"
                      >
                        Hủy dẫn đường
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // TRẠNG THÁI 2: CHƯA CHỌN GÌ (LIST DEMO)
              <>
                <div className="mb-4 shrink-0 flex items-center justify-between">
                  <h3 className="text-gray-900 font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Tiện ích mẫu
                  </h3>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Demo</Badge>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {nearbyEntities.map((entity) => (
                    <button 
                      key={entity.id} 
                      className="w-full text-left p-3 rounded-[12px] bg-white hover:bg-gray-50 border border-gray-100 transition-all group"
                      // Giả lập click vào entity để hiển thị sidebar chi tiết (nếu muốn)
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-[10px] ${entity.bgColor} shrink-0 group-hover:scale-110 transition-transform`}>
                          <entity.icon className={`w-5 h-5 ${entity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">{entity.name}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">0.5 km</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">Chọn một marker hoặc tìm kiếm để xem chi tiết</p>
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}