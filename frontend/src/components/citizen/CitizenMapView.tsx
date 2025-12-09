/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '../ui/badge';
import { 
  Bus, MapPin, Search, 
  Map, Activity, X, Loader2, Navigation, CornerUpRight, Compass,
  Wind, CloudSun, Droplets, CloudFog, AlertTriangle, Car,
  Clock, Ruler, CornerDownRight, CornerUpLeft, ArrowUp, Flag, MousePointerClick, LocateFixed,
  Warehouse, CircleDollarSign, Ticket
} from 'lucide-react';
import type { NgsiEntity } from '../maps/RealMap';
import { formatAddress } from '@/lib/utils';

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

const RealMap = dynamic(() => import('../maps/RealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-white animate-pulse flex flex-col items-center justify-center gap-3 text-gray-400 rounded-[14px]" style={borderStyle}>
       <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
       <span className="text-sm font-medium">Đang tải bản đồ thành phố...</span>
    </div>
  )
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- HELPER: LẤY TÊN HIỂN THỊ CHO SUGGESTION ---
const getDisplayName = (item: any) => {
  if (item.name) return item.name;

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

  const landmarkName = candidates.find(c => c);
  if (landmarkName) return landmarkName;

  if (item.address?.road) {
    return `${item.address.house_number ? item.address.house_number + ' ' : ''}${item.address.road}`;
  }

  return item.display_name.split(',')[0];
};

// --- HELPER: LẤY TOẠ ĐỘ AN TOÀN ---
const getEntityCoordinates = (entity: NgsiEntity): [number, number] | null => {
    if (!entity.location) return null;
    
    let coords: any = null;
    // Trường hợp 1: GeoJSON nested (NGSI-LD chuẩn)
    if (entity.location.value && Array.isArray(entity.location.value.coordinates)) {
        coords = entity.location.value.coordinates;
    }
    // Trường hợp 2: GeoJSON flattened
    else if (Array.isArray(entity.location.coordinates)) {
        coords = entity.location.coordinates;
    }
    // Trường hợp 3: Mảng trực tiếp
    else if (Array.isArray(entity.location)) {
        coords = entity.location;
    }

    // GeoJSON [Lon, Lat] -> Cần trả về để map xử lý
    if (coords && coords.length === 2) {
        return [coords[0], coords[1]]; 
    }
    return null;
};

// --- HELPER: LẤY TÊN HIỂN THỊ CHO BUS ---
const getBusDisplayName = (entity: NgsiEntity) => {
    const nameVal = entity.name?.value || entity.name;
    // Nếu có tên và không phải N/A
    if (nameVal && typeof nameVal === 'string' && nameVal !== 'N/A') {
        return nameVal;
    }
    
    // Nếu ID là số, thêm chữ "Trạm"
    const idDisplay = entity.id.split(':').pop() || entity.id;
    if (/^\d+$/.test(idDisplay)) return `Trạm ${idDisplay}`;

    const addr = entity.address;
    if (!addr) return idDisplay;

    if (typeof addr === 'object') {
        if (addr.value) { 
             return addr.value.streetAddress || addr.value.addressLocality || addr.value.road || idDisplay;
        }
        return addr.streetAddress || addr.road || addr.addressLocality || idDisplay;
    }
    
    return String(addr) || idDisplay;
};

// --- HELPER DỊCH THUẬT ---
const translateInstruction = (text: string) => {
    if (!text) return "";
    let t = text;

    t = t.replace(/\bYou have arrived at your destination/gi, 'Bạn đã đến nơi');
    t = t.replace(/\bYou have arrived/gi, 'Bạn đã đến nơi');
    t = t.replace(/\bYour destination is on the left/gi, 'Điểm đến nằm ở bên trái');
    t = t.replace(/\bYour destination is on the right/gi, 'Điểm đến nằm ở bên phải');
    t = t.replace(/\bDestination\b/gi, 'Điểm đến');
    t = t.replace(/\bWaypoint\b/gi, 'Điểm dừng');

    t = t.replace(/\bthe traffic circle/gi, 'vòng xoay');
    t = t.replace(/\broundabout/gi, 'vòng xuyến');
    t = t.replace(/\bTake the ramp/gi, 'Đi đoạn đường nối');
    
    t = t.replace(/\bEnter the (vòng xoay|vòng xuyến) and take the (\d+)(st|nd|rd|th) exit/gi, 'Vào $1 và đi theo lối ra thứ $2');
    t = t.replace(/\bEnter the (vòng xoay|vòng xuyến)/gi, 'Đi vào $1');
    t = t.replace(/\bTake the (\d+)(st|nd|rd|th) exit/gi, 'Đi theo lối ra thứ $1');
    t = t.replace(/\bexit/gi, 'lối ra');

    t = t.replace(/\bNorth\b/gi, 'Bắc');
    t = t.replace(/\bSouth\b/gi, 'Nam');
    t = t.replace(/\bEast\b/gi, 'Đông');
    t = t.replace(/\bWest\b/gi, 'Tây');
    t = t.replace(/\bNortheast\b/gi, 'Đông Bắc');
    t = t.replace(/\bNorthwest\b/gi, 'Tây Bắc');
    t = t.replace(/\bSoutheast\b/gi, 'Đông Nam');
    t = t.replace(/\bSouthwest\b/gi, 'Tây Nam');

    t = t.replace(/\bMake a U-turn\b/gi, 'Quay đầu xe'); 
    t = t.replace(/\bMake a\b/gi, 'Thực hiện');          

    t = t.replace(/\bTurn left\b/gi, 'Rẽ trái');
    t = t.replace(/\bTurn right\b/gi, 'Rẽ phải');
    t = t.replace(/\bSlight left\b/gi, 'Chếch sang trái');
    t = t.replace(/\bSlight right\b/gi, 'Chếch sang phải');
    t = t.replace(/\bSharp left\b/gi, 'Rẽ ngoặt sang trái');
    t = t.replace(/\bSharp right\b/gi, 'Rẽ ngoặt sang phải');
    t = t.replace(/\bKeep left\b/gi, 'Đi sát bên trái');
    t = t.replace(/\bKeep right\b/gi, 'Đi sát bên phải');
    t = t.replace(/\bMerge\b/gi, 'Nhập làn');
    t = t.replace(/\bleft\b/gi, 'trái');
    t = t.replace(/\bright\b/gi, 'phải');
    t = t.replace(/\bGo straight\b/gi, 'Đi thẳng tiếp');
    t = t.replace(/\bstraight\b/gi, 'thẳng');
    t = t.replace(/\bHead\b/gi, 'Đi về hướng');
    t = t.replace(/\bEnter\b/gi, 'Đi vào');
    t = t.replace(/\bContinue\b/gi, 'Tiếp tục đi');
    t = t.replace(/\bonto\b/gi, 'vào');
    t = t.replace(/\bon\b/gi, 'trên');
    t = t.replace(/\bat\b/gi, 'tại');
    t = t.replace(/\btowards\b/gi, 'về phía');
    t = t.replace(/\bthe fork\b/gi, 'ngã ba');
    t = t.replace(/\bon the left/gi, 'ở bên trái');
    t = t.replace(/\bon the right/gi, 'ở bên phải');
    t = t.replace(/\bthe left/gi, 'bên trái');
    t = t.replace(/\bthe right/gi, 'bên phải');
    t = t.replace(/\byour\b/gi, 'của bạn');

    t = t.replace(/\bto stay\b/gi, 'để vào');
    t = t.replace(/\s+/g, " ").trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
};


export function CitizenMapView() {
  const [searchQuery, setSearchQuery] = useState(''); 
  const debouncedQuery = useDebounce(searchQuery, 500); 
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7721, 106.6983]); 
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  const [layerDomain, setLayerDomain] = useState<string>('weather');
  const [markerFilter, setMarkerFilter] = useState('');
  const [realEntityCount, setRealEntityCount] = useState(0);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedRealEntity, setSelectedRealEntity] = useState<NgsiEntity | null>(null);
  
  // --- STATES CHO NAVIGATION ---
  const [isPreparingNav, setIsPreparingNav] = useState(false);
  const [startPointMode, setStartPointMode] = useState<'gps' | 'custom'>('gps');
  const [startPointQuery, setStartPointQuery] = useState('');
  const [startPointSuggestions, setStartPointSuggestions] = useState<any[]>([]);
  const [selectedCustomStart, setSelectedCustomStart] = useState<{name: string, lat: number, lon: number} | null>(null);
  const debouncedStartQuery = useDebounce(startPointQuery, 500);

  const [routeCoords, setRouteCoords] = useState<{ start: [number, number], end: [number, number] } | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routeInfos, setRouteInfos] = useState<{ summary: any, instructions: any[] } | null>(null);
  
  const watchIdRef = useRef<number | null>(null);

  // --- LOGIC TÌM KIẾM CHUNG ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const viewbox = '106.3,11.2,107.0,10.3';
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

  // --- LOGIC TÌM KIẾM ĐIỂM BẮT ĐẦU (CUSTOM START) ---
  useEffect(() => {
    const fetchStartSuggestions = async () => {
      if (!debouncedStartQuery.trim() || startPointMode === 'gps') {
        setStartPointSuggestions([]);
        return;
      }
      try {
        const viewbox = '106.3,11.2,107.0,10.3';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedStartQuery)}&countrycodes=vn&viewbox=${viewbox}&bounded=1&limit=3`;
        const res = await fetch(url);
        const data = await res.json();
        setStartPointSuggestions(data);
      } catch (e) {
        console.error("Start point search error", e);
      }
    };
    fetchStartSuggestions();
  }, [debouncedStartQuery, startPointMode]);

  const getVal = (prop: any) => {
    if (prop === undefined || prop === null) return undefined;
    if (typeof prop === 'object' && prop !== null && 'value' in prop) return prop.value;
    return prop;
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    setMapCenter([lat, lon]);      
    setSearchMarker([lat, lon]);   
    setSearchQuery(getDisplayName(item));
    setShowSuggestions(false);
  
    // Tạo entity giả lập cho kết quả tìm kiếm với type đặc biệt
    const fakeEntity: any = {
      id: 'search:result',
      type: 'SearchResult', // Đánh dấu để phân biệt
      name: { value: getDisplayName(item) },
      location: { value: { coordinates: [lon, lat] } }, 
      address: { value: { streetAddress: item.display_name } }
    };
    handleEntityClick(fakeEntity); 
  };

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
    setRouteInfos(null);
    setIsPreparingNav(false);
    setStartPointMode('gps');
    setStartPointQuery('');
    setSelectedCustomStart(null);
    stopRealtimeTracking();
  };

  const handleRouteFound = (summary: any, instructions: any[]) => {
    setRouteInfos({ summary, instructions });
    setIsRoutingLoading(false);
  };

  const stopRealtimeTracking = () => {
      if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
      }
  };

  const openNavigationSetup = () => {
    setIsPreparingNav(true);
  };

  const executeNavigation = () => {
     if (!selectedRealEntity) return;

     const coords = getEntityCoordinates(selectedRealEntity);
     if (!coords) {
         alert("Không xác định được toạ độ điểm đến.");
         return;
     }

     const [destLng, destLat] = coords;
     const destCoords: [number, number] = [destLat, destLng];

     setIsRoutingLoading(true);
     setRouteInfos(null);

     if (startPointMode === 'custom') {
        if (!selectedCustomStart) {
            alert("Vui lòng chọn điểm bắt đầu từ gợi ý tìm kiếm.");
            setIsRoutingLoading(false);
            return;
        }
        setRouteCoords({
            start: [selectedCustomStart.lat, selectedCustomStart.lon],
            end: destCoords
        });
        setMapCenter([selectedCustomStart.lat, selectedCustomStart.lon]);
     } else {
        if (!navigator.geolocation) {
             alert("Trình duyệt không hỗ trợ định vị GPS.");
             setIsRoutingLoading(false);
             return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const currentLat = pos.coords.latitude;
                const currentLon = pos.coords.longitude;
                
                setRouteCoords({
                    start: [currentLat, currentLon],
                    end: destCoords
                });
                setMapCenter([currentLat, currentLon]);

                stopRealtimeTracking(); 
                const id = navigator.geolocation.watchPosition(
                    (newPos) => {
                        const newLat = newPos.coords.latitude;
                        const newLon = newPos.coords.longitude;
                        
                        setMapCenter([newLat, newLon]);

                        setRouteCoords(prev => {
                            if (!prev) return null;
                            const dist = Math.sqrt(Math.pow(newLat - prev.start[0], 2) + Math.pow(newLon - prev.start[1], 2));
                            if (dist > 0.0001) {
                                return { ...prev, start: [newLat, newLon] };
                            }
                            return prev;
                        });
                    },
                    (err) => console.error("Tracking error", err),
                    { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
                );
                watchIdRef.current = id;
            },
            (err) => {
                console.error(err);
                alert("Không thể lấy vị trí GPS. Hãy kiểm tra quyền truy cập.");
                setIsRoutingLoading(false);
            },
            { enableHighAccuracy: true }
        );
     }
  };

  useEffect(() => {
      return () => stopRealtimeTracking();
  }, []);

  // [UPDATED] Hàm lấy tên hiển thị, đã được cập nhật để hiển thị tên chuẩn cho Bus
  const getEntityName = () => {
    if (!selectedRealEntity) return '';

    // [FIXED] Chỉ coi là Bus nếu không phải kết quả tìm kiếm
    const isBus = (selectedRealEntity.type?.includes('Bus') || layerDomain === 'bus') && selectedRealEntity.type !== 'SearchResult';
    if (isBus) {
        return getBusDisplayName(selectedRealEntity);
    }

    return selectedRealEntity.name?.value || selectedRealEntity.id.split(':').pop() || 'Địa điểm đã chọn';
  };

  const getDirectionIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('left') || lower.includes('trái')) return <CornerUpLeft className="w-4 h-4 text-blue-600" />;
    if (lower.includes('right') || lower.includes('phải')) return <CornerUpRight className="w-4 h-4 text-blue-600" />;
    if (lower.includes('straight') || lower.includes('thẳng')) return <ArrowUp className="w-4 h-4 text-blue-600" />;
    if (lower.includes('finish') || lower.includes('đến')) return <Flag className="w-4 h-4 text-red-600" />;
    if (lower.includes('u-turn')) return <Navigation className="w-4 h-4 text-orange-600 rotate-180" />;
    return <CornerDownRight className="w-4 h-4 text-gray-400" />;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours} giờ ${remainMins} phút`;
  };

  const getSafeAddressString = (entity: any) => {
    const addr = entity.address;
    if (!addr) return '';

    if (typeof addr === 'string') return addr;

    if (addr.value) {
        if (typeof addr.value === 'string') return addr.value;
        return addr.value.streetAddress || addr.value.addressLocality || '';
    }

    if (typeof addr === 'object') {
        return addr.streetAddress || addr.addressLocality || '';
    }

    return '';
};

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div 
        className="bg-white rounded-[14px] p-4 shadow-sm sticky top-0 z-30" 
        style={borderStyle} 
        ref={searchContainerRef}
      >
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm địa điểm (VD: Đại học Bách Khoa)..." 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="w-full pl-10 pr-10 py-3 rounded-[14px] border-none bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-inner"
              style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : 
                searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchMarker(null); setSuggestions([]); handleEntityClick(null as any); }}>
                    <X className="w-4 h-4 hover:text-red-500 transition-colors" />
                  </button>
                )
              }
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[14px] shadow-lg overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 z-40"
                style={borderStyle}
              >
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 rounded-[10px] shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <MapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
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
        <div 
            className="lg:col-span-2 bg-white rounded-[14px] p-1 shadow-sm flex flex-col h-[650px]" 
            style={borderStyle}
        >
          {/* Map Controls */}
          <div className="p-4 flex flex-col xl:flex-row gap-3 justify-between items-center">
            <div className="flex gap-3 w-full xl:w-auto">
              <select
                value={layerDomain}
                onChange={(e) => { setLayerDomain(e.target.value); setMarkerFilter(''); }}
                className="pl-3 pr-8 py-2.5 bg-gray-50 rounded-[14px] text-sm font-medium border-transparent focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all hover:bg-gray-100 w-full xl:w-auto"
              >
                <option value="weather">⛈️ Thời tiết</option>
                <option value="air">🌫 Không khí</option>
                <option value="parking">🅿️ Bãi đỗ xe</option>
                <option value="bus">🚌 Trạm Bus</option>
              </select>
            </div>
            <div className={`px-3 py-1.5 rounded-[10px] flex items-center gap-1.5 text-xs font-medium border ${isMapLoading ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
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
              onRouteFound={handleRouteFound} 
            />
          </div>
        </div>

        {/* CỘT PHẢI: SIDEBAR THÔNG MINH */}
        <div className="space-y-4 h-[650px] flex flex-col">
          <div 
            className="bg-white rounded-[14px] p-5 shadow-sm flex-1 flex flex-col overflow-hidden relative" 
            style={borderStyle}
          >
            {selectedRealEntity ? (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                {/* Header & Back Button */}
                <div className="mb-2 pb-2 border-b border-gray-100">
                  <button 
                    onClick={() => { handleEntityClick(null as any); }}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 mb-2 transition-colors font-medium px-2 py-1 hover:bg-blue-50 rounded-[10px] w-fit -ml-2"
                  >
                    <CornerUpRight className="w-3 h-3 rotate-180" /> Quay lại danh sách
                  </button>
                  
                  {/* [UPDATED] Hiển thị tên (Đã dùng getEntityName mới) */}
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {getEntityName()}
                  </h3>
                  
                  {!isPreparingNav && !routeCoords && (
                     <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" /> 
                        <span className="line-clamp-3 italic">
                          {/* [FIXED] Sửa logic hiển thị địa chỉ để không hiện "Đang cập nhật" khi tìm kiếm */}
                          {selectedRealEntity.type === 'SearchResult' 
                            ? getSafeAddressString(selectedRealEntity)
                            : (selectedRealEntity.type?.includes('Bus') ? 'Đang cập nhật' : formatAddress(getSafeAddressString(selectedRealEntity).replace('Unknown Street', 'Đang cập nhật') || 'Đang cập nhật'))
                          }
                        </span>
                    </p>
                  )}
                </div>

                {/* --- 1. GIAO DIỆN CHUẨN BỊ CHỈ ĐƯỜNG (SETUP) --- */}
                {isPreparingNav && !routeCoords && (
                    <div className="flex-1 flex flex-col">
                         <h4 className="font-bold text-gray-800 text-sm uppercase mb-3 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-blue-600" /> Thiết lập lộ trình
                         </h4>

                         <div className="space-y-4 bg-gray-50 p-4 rounded-[14px] border border-gray-100">
                            {/* Điểm đi */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase">Điểm bắt đầu</label>
                                <div className="flex gap-2 mb-2">
                                    <button 
                                        onClick={() => setStartPointMode('gps')}
                                        className={`flex-1 py-2 text-xs font-medium rounded-[8px] border transition-all ${startPointMode === 'gps' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        <LocateFixed className="w-3 h-3 inline mr-1" /> GPS
                                    </button>
                                    <button 
                                        onClick={() => setStartPointMode('custom')}
                                        className={`flex-1 py-2 text-xs font-medium rounded-[8px] border transition-all ${startPointMode === 'custom' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        <MousePointerClick className="w-3 h-3 inline mr-1" /> Chọn điểm
                                    </button>
                                </div>

                                {startPointMode === 'custom' && (
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Nhập vị trí bắt đầu..."
                                            value={startPointQuery}
                                            onChange={(e) => setStartPointQuery(e.target.value)}
                                            className="w-full text-sm px-3 py-2 rounded-[8px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {startPointSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-[8px] z-20 max-h-[200px] overflow-y-auto">
                                                {startPointSuggestions.map((item, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs border-b border-gray-50 last:border-0"
                                                        onClick={() => {
                                                            setStartPointQuery(getDisplayName(item));
                                                            setSelectedCustomStart({
                                                                name: getDisplayName(item),
                                                                lat: parseFloat(item.lat),
                                                                lon: parseFloat(item.lon)
                                                            });
                                                            setStartPointSuggestions([]);
                                                        }}
                                                    >
                                                        <p className="font-medium truncate">{getDisplayName(item)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Điểm đến */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase">Điểm đến</label>
                                <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-[8px]">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-900 truncate">{getEntityName()}</span>
                                </div>
                            </div>
                         </div>

                         <div className="mt-auto pt-4">
                            <button 
                                onClick={executeNavigation}
                                disabled={isRoutingLoading || (startPointMode === 'custom' && !selectedCustomStart)}
                                className="w-full py-3 bg-blue-600 text-white rounded-[14px] font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isRoutingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                                Bắt đầu đi
                            </button>
                            <button 
                                onClick={() => setIsPreparingNav(false)}
                                className="w-full py-2 mt-2 text-gray-500 text-sm hover:text-gray-800"
                            >
                                Hủy bỏ
                            </button>
                         </div>
                    </div>
                )}

                {/* --- 2. GIAO DIỆN ĐANG CHỈ ĐƯỜNG (NAVIGATING) --- */}
                {routeCoords ? (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="bg-gray-50 p-3 rounded-[12px] border border-gray-100 mb-3 space-y-2">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 bg-green-600 rounded-full border border-white shadow-sm" />
                         </div>
                         <div className="flex-1">
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Từ</p>
                             <p className="text-xs font-medium text-gray-800 truncate">
                                {startPointMode === 'gps' ? 'Vị trí hiện tại (GPS)' : (selectedCustomStart?.name || 'Điểm đã chọn')}
                             </p>
                         </div>
                      </div>
                      <div className="ml-3 border-l border-dashed border-gray-300 h-2"></div>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                         </div>
                         <div className="flex-1">
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Đến</p>
                             <p className="text-xs font-medium text-gray-800 truncate">{getEntityName()}</p>
                         </div>
                      </div>
                    </div>

                    {/* Thông tin tổng quan tuyến đường */}
                    {routeInfos && routeInfos.summary ? (
                       <div className="flex gap-2 mb-3">
                          <div className="flex-1 bg-blue-50 p-3 rounded-[12px] border border-blue-100 flex items-center justify-center flex-col">
                             <Clock className="w-5 h-5 text-blue-600 mb-1" />
                             <span className="text-lg font-bold text-blue-700">{formatTime(routeInfos.summary.totalTime)}</span>
                             <span className="text-[10px] text-blue-500 uppercase">Thời gian</span>
                          </div>
                          <div className="flex-1 bg-indigo-50 p-3 rounded-[12px] border border-indigo-100 flex items-center justify-center flex-col">
                             <Ruler className="w-5 h-5 text-indigo-600 mb-1" />
                             <span className="text-lg font-bold text-indigo-700">{formatDistance(routeInfos.summary.totalDistance)}</span>
                             <span className="text-[10px] text-indigo-500 uppercase">Khoảng cách</span>
                          </div>
                       </div>
                    ) : (
                       <div className="p-4 text-center text-gray-400 text-sm flex flex-col items-center">
                          <Loader2 className="w-6 h-6 animate-spin mb-2" />
                          Đang tính toán lộ trình...
                       </div>
                    )}

                    {/* Danh sách hướng dẫn */}
                    <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-2 relative">
                        {routeInfos?.instructions?.map((step: any, idx: number) => {
                           const translatedText = translateInstruction(step.text);
                           return (
                             <div key={idx} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-[10px] hover:bg-gray-50 transition-colors">
                                <div className="mt-0.5 shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                   {getDirectionIcon(step.text)}
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm text-gray-700 font-medium leading-snug">
                                      {translatedText}
                                   </p>
                                   <p className="text-xs text-gray-400 mt-1">{formatDistance(step.distance)}</p>
                                </div>
                             </div>
                           );
                        })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => { 
                              setRouteCoords(null); 
                              setRouteInfos(null); 
                              stopRealtimeTracking(); 
                          }}
                          className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-[12px] font-medium hover:bg-gray-200 transition-colors text-sm"
                        >
                          Kết thúc dẫn đường
                        </button>
                    </div>
                  </div>
                ) : (
                  // --- 3. GIAO DIỆN CHI TIẾT ENTITY (DEFAULT) ---
                  !isPreparingNav && (
                    <div className="flex-1 overflow-y-auto">
                        {(() => {
                        const isWeather = selectedRealEntity.type?.includes('Weather') || getVal(selectedRealEntity.temperature) !== undefined;
                        const isAir = selectedRealEntity.type?.includes('Air') || getVal(selectedRealEntity.airQualityIndex) !== undefined;
                        
                        // [CRITICAL FIX] Logic phân loại chặt chẽ hơn:
                        // Chỉ hiển thị UI đặc biệt nếu KHÔNG PHẢI là kết quả tìm kiếm (SearchResult)
                        const isSearchResult = selectedRealEntity.type === 'SearchResult';
                        const isBus = !isSearchResult && (selectedRealEntity.type?.includes('Bus') || layerDomain === 'bus');
                        const isParking = !isSearchResult && (selectedRealEntity.type?.includes('Parking') || layerDomain === 'parking');

                        if (isWeather) {
                            const valTemp = getVal(selectedRealEntity.temperature);
                            const temp = Number(valTemp ?? 25);

                            const getTempColors = (temperature: number) => {
                            if (temperature >= 35) return { gradient: 'from-red-500 to-orange-600', shadow: 'shadow-red-200', text: 'text-red-100', icon: '🔥' };
                            if (temperature >= 30) return { gradient: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-200', text: 'text-orange-100', icon: '☀️' };
                            if (temperature >= 25) return { gradient: 'from-yellow-400 to-orange-400', shadow: 'shadow-yellow-200', text: 'text-yellow-100', icon: '🌤️' };
                            if (temperature >= 20) return { gradient: 'from-green-400 to-teal-500', shadow: 'shadow-green-200', text: 'text-green-100', icon: '🌿' };
                            if (temperature >= 15) return { gradient: 'from-blue-400 to-cyan-500', shadow: 'shadow-blue-200', text: 'text-blue-100', icon: '❄️' };
                            return { gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-200', text: 'text-indigo-100', icon: '🧊' };
                            };
                            const tempColors = getTempColors(temp);
                            
                            return (
                            <div className="space-y-4">
                                <div className={`bg-gradient-to-br ${tempColors.gradient} rounded-[14px] p-6 text-white shadow-lg ${tempColors.shadow} relative overflow-hidden`}>
                                <div className="absolute top-[-20px] right-[-20px] opacity-20">
                                    <CloudSun size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className={`${tempColors.text} text-sm font-medium uppercase tracking-wider flex items-center gap-2`}>
                                    <span>{tempColors.icon}</span> Nhiệt độ hiện tại
                                    </p>
                                    <div className="flex items-end gap-2 mt-1">
                                    <span className="text-6xl font-bold tracking-tighter">
                                        {valTemp ?? '--'}
                                    </span>
                                    <span className="text-3xl font-medium mb-2">°C</span>
                                    </div>
                                    <p className="mt-2 text-white/90 flex items-center gap-2 text-xs">
                                    <Activity className="w-4 h-4" /> 
                                    Cập nhật: {getVal(selectedRealEntity.dateObserved) ? new Date(getVal(selectedRealEntity.dateObserved)).toLocaleTimeString() : 'Vừa xong'}
                                    </p>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-4 rounded-[14px] border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <Droplets className="w-5 h-5" />
                                        <span className="text-sm font-bold">Độ ẩm</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                        {getVal(selectedRealEntity.humidity) ?? getVal(selectedRealEntity.relativeHumidity) ?? '--'}%
                                        </p>
                                    </div>

                                    <div className="bg-emerald-50 p-4 rounded-[14px] border border-emerald-100">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <Wind className="w-5 h-5" />
                                        <span className="text-sm font-bold">Gió</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                        {getVal(selectedRealEntity.windSpeed) ?? '--'} <span className="text-sm font-normal text-gray-500">m/s</span>
                                        </p>
                                    </div>
                                    
                                    {getVal(selectedRealEntity.rain) !== undefined && (
                                        <div className="bg-indigo-50 p-4 rounded-[14px] border border-indigo-100 col-span-2">
                                            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                            <CloudSun className="w-5 h-5" />
                                            <span className="text-sm font-bold">Lượng mưa (1h)</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-800">
                                            {getVal(selectedRealEntity.rain)} <span className="text-sm font-normal text-gray-500">mm</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            );
                        }

                        if (isAir) {
                            const valAqi = getVal(selectedRealEntity.airQualityIndex);
                            const aqi = Number(valAqi ?? 1);

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
                                <div className={`bg-gradient-to-br ${status.color} rounded-[14px] p-6 text-white shadow-lg relative overflow-hidden`}>
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

                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Thành phần ô nhiễm</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Bụi mịn PM2.5</p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {getVal(selectedRealEntity.pm25) ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Bụi PM10</p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {getVal(selectedRealEntity.pm10) ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Khí CO</p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {getVal(selectedRealEntity.co) ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Khí NO2</p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {getVal(selectedRealEntity.no2) ?? '--'} <span className="text-xs font-normal">µg/m³</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                        }

                        if (isBus) {
                            const coords = getEntityCoordinates(selectedRealEntity);
                            const lon = coords ? coords[0] : 0;
                            const lat = coords ? coords[1] : 0;

                            return (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[14px] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                    <Bus className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Trạm xe buýt</span>
                                            </div>
                                            
                                            <h2 className="text-2xl font-bold leading-tight mb-4">
                                                {getEntityName()}
                                            </h2>

                                            <div className="flex items-center gap-2 text-sm text-white/90 font-medium border border-white/30 rounded-lg px-3 py-1.5 w-fit">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <span className="font-mono">{lat.toFixed(6)}, {lon.toFixed(6)}</span>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                                            <Bus size={120} />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-blue-50 rounded-[14px] p-4 border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-[10px]">
                                                <Navigation className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Điều hướng thông minh</p>
                                                <p className="text-xs text-blue-600">
                                                    {routeCoords ? 'Đang dẫn đường...' : 'Sẵn sàng tính toán lộ trình tới trạm này'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* [FIXED] Nút chỉ đường cho BUS */}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <button 
                                            onClick={openNavigationSetup}
                                            disabled={isRoutingLoading}
                                            className="w-full py-3 bg-blue-600 text-white rounded-[14px] font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
                                        >
                                            <Navigation className="w-5 h-5" />
                                            Chỉ đường tới đây
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        if (isParking) {
                            const available = Number(getVal(selectedRealEntity.availableSpotNumber) ?? 0);
                            const total = Number(getVal(selectedRealEntity.totalSpotNumber) ?? 100); 
                            const occupancy = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
                            const price = getVal(selectedRealEntity.price) ?? 'Miễn phí';
                            const openingHours = getVal(selectedRealEntity.openingHours) ?? '24/7';
                            
                            let statusColor = { gradient: 'from-blue-600 to-indigo-600', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
                            if (available === 0) statusColor = { gradient: 'from-red-600 to-rose-600', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
                            else if (available < 10) statusColor = { gradient: 'from-orange-500 to-amber-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
                            else statusColor = { gradient: 'from-emerald-500 to-green-600', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };

                            return (
                                <div className="space-y-4">
                                    {/* Header Status Card */}
                                    <div className={`bg-gradient-to-br ${statusColor.gradient} rounded-[14px] p-6 text-white shadow-lg relative overflow-hidden`}>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                    <Car className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Bãi đỗ xe</span>
                                            </div>
                                            
                                            <div className="flex items-end gap-2 mb-1">
                                                <span className="text-6xl font-bold tracking-tighter">{available}</span>
                                                <span className="text-xl font-medium mb-2 opacity-90">chỗ trống</span>
                                            </div>
                                            <p className="text-sm text-white/80">Tổng sức chứa: {total} xe</p>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                                            <Car size={140} />
                                        </div>
                                    </div>

                                    {/* Occupancy Progress */}
                                    <div className="bg-white border border-gray-100 rounded-[14px] p-4 shadow-sm">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500 font-medium">Trạng thái lấp đầy</span>
                                            <span className={`font-bold ${statusColor.text}`}>{occupancy}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${available === 0 ? 'bg-red-500' : available < 10 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                                style={{ width: `${occupancy}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Warehouse className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">Loại hình</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">
                                                {getVal(selectedRealEntity.category) || 'Công cộng'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <CircleDollarSign className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">Giá vé</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 truncate" title={price}>
                                                {price}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-[14px] border border-gray-100 col-span-2">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">Giờ mở cửa</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">
                                                {openingHours}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Navigation Button */}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <button 
                                            onClick={openNavigationSetup}
                                            disabled={isRoutingLoading}
                                            className="w-full py-3 bg-blue-600 text-white rounded-[14px] font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
                                        >
                                            <Navigation className="w-5 h-5" />
                                            Dẫn đường đến bãi đỗ
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // [FIXED] Default Return: Chỉ dùng cho Search Result hoặc Point Marker thông thường
                        // (Không bị lặp nút bấm do dùng if/else if)
                        return (
                          <>
                            <div className="bg-blue-50 rounded-[14px] p-4 mb-4 border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-[10px]">
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
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={openNavigationSetup}
                                    disabled={isRoutingLoading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-[14px] font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100 disabled:opacity-70 disabled:bg-gray-400"
                                >
                                    <Compass className="w-5 h-5" />
                                    Chỉ đường tới đây
                                </button>
                            </div>
                          </>
                        );
                        })()}
                    </div>
                  )
                )}
              </div>
            ) : (
              // TRẠNG THÁI 2: DASHBOARD (Giữ nguyên)
              <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
                <div className="rounded-[14px] p-4 bg-white shadow-sm" style={borderStyle}>
                  <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600" /> 
                    Trạng thái hệ thống
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-[14px] shadow-sm" style={borderStyle}>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Điểm giám sát</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {realEntityCount > 0 ? realEntityCount : '--'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-[14px] shadow-sm" style={borderStyle}>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Cập nhật</p>
                      <p className="text-lg font-bold text-green-600 mt-1">Real-time</p>
                      <p className="text-[10px] text-gray-400">Mỗi 30 giây</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-[14px] p-4 overflow-y-auto shadow-sm" style={borderStyle}>
                  <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                    <Map className="w-5 h-5 text-gray-600" /> 
                    Chú giải ký hiệu
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] transition-colors hover:shadow-sm" style={borderStyle}>
                      <div className="w-9 h-9 rounded-full bg-[#f97316] border-2 border-white shadow-md flex items-center justify-center">
                        <CloudSun size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Trạm Thời tiết</p>
                        <p className="text-xs text-gray-500">Nhiệt độ, độ ẩm, gió</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] transition-colors hover:shadow-sm" style={borderStyle}>
                      <div className="w-9 h-9 rounded-full bg-[#10b981] border-2 border-white shadow-md flex items-center justify-center">
                        <Wind size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Quan trắc Không khí</p>
                        <p className="text-xs text-gray-500">Chỉ số AQI, bụi PM2.5</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] transition-colors hover:shadow-sm" style={borderStyle}>
                      <div className="w-9 h-9 rounded-full bg-[#2563eb] border-2 border-white shadow-md flex items-center justify-center">
                        <Car size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Bãi đỗ xe thông minh</p>
                        <p className="text-xs text-gray-500">Hiển thị số chỗ trống</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-[14px] transition-colors hover:shadow-sm" style={borderStyle}>
                      <div className="w-9 h-9 rounded-full bg-[#4f46e5] border-2 border-white shadow-md flex items-center justify-center">
                        <Bus size={18} className="text-white" />
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