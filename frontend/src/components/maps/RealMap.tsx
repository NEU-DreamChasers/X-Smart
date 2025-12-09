/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ApiService } from '@/services/api.service';

if (typeof window !== 'undefined') {
  try {
    require('leaflet-routing-machine');
  } catch (e) { console.error(e); }
}

import { renderToStaticMarkup } from 'react-dom/server';
import { 
  CloudSun, Wind, Car, Bus, MapPin, Navigation, Store, 
  Thermometer, CloudRain, Gauge, Cloud, EyeOff, Layers, Waves
} from 'lucide-react';
import { formatAddress } from '@/lib/utils';

// [UPDATED] API KEY cho OpenWeatherMap
const OWM_API_KEY = 'eb3a4947904547285aa7bdecca8cc396';

// [UPDATED] Định nghĩa các lớp bản đồ chuẩn (Weather Maps 1.0 compatible)
// Sử dụng các mã _new để đảm bảo tương thích với API Key tiêu chuẩn
const OWM_LAYERS = [
    { id: 'temp_new', name: 'Nhiệt độ', icon: <Thermometer size={18} /> },
    { id: 'precipitation_new', name: 'Lượng mưa', icon: <CloudRain size={18} /> },
    { id: 'wind_new', name: 'Sức gió', icon: <Wind size={18} /> },
    { id: 'clouds_new', name: 'Mây phủ', icon: <Cloud size={18} /> },
    { id: 'pressure_new', name: 'Áp suất', icon: <Gauge size={18} /> },
];

export interface NgsiEntity {
  id: string;
  type: string;
  location?: any; 
  address?: any;
  name?: any;
  [key: string]: any;
}

interface RealMapProps {
  domain?: string;
  searchTerm?: string;
  onDataLoaded?: (count: number, loading: boolean) => void;
  center?: [number, number];
  zoom?: number;
  searchMarker?: [number, number] | null;
  routeCoordinates?: { start: [number, number]; end: [number, number] } | null;
  onSelectEntity?: (entity: NgsiEntity) => void; 
  entities?: NgsiEntity[];
  onRouteFound?: (summary: any, instructions: any[]) => void;
}

// --- Helper Functions ---
function RoutingMachine({ routeCoords, onRouteFound }: { 
  routeCoords: { start: [number, number]; end: [number, number] } | null | undefined,
  onRouteFound?: (summary: any, instructions: any[]) => void
}) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    
    if (!routeCoords) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    const startLatLng = L.latLng(routeCoords.start[0], routeCoords.start[1]);
    const endLatLng = L.latLng(routeCoords.end[0], routeCoords.end[1]);
    const waypoints = [startLatLng, endLatLng];

    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(waypoints);
      return;
    }

    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false, 
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: { 
        styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }] 
      },
      draggableWaypoints: false,
      addWaypoints: false,      
      createMarker: function(i: number, waypoint: any, n: number) {
        if (i === 0) {
             return L.marker(waypoint.latLng, {
                draggable: false,
                icon: L.divIcon({
                    html: renderToStaticMarkup(
                        <div className="relative flex items-center justify-center">
                            <span className="absolute w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></span>
                            <span className="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-sm"></span>
                        </div>
                    ),
                    className: 'bg-transparent border-none',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
             });
        }
        const iconHtml = renderToStaticMarkup(
          <div style={{ color: '#dc2626', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
             <MapPin size={32} fill="currentColor" stroke="white" strokeWidth={2} />
          </div>
        );
        return L.marker(waypoint.latLng, {
          draggable: false,
          icon: L.divIcon({
            html: iconHtml,
            className: 'bg-transparent border-none',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        });
      },
      containerClassName: 'hidden-routing-container', 
    }).addTo(map);

    routingControl.on('routesfound', function(e: any) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        if (onRouteFound) onRouteFound(route.summary, route.instructions);
      }
    });

    const style = document.createElement('style');
    style.innerHTML = `.hidden-routing-container { display: none !important; }`;
    document.head.appendChild(style);

    routingControlRef.current = routingControl;
  }, [routeCoords, map]);
  return null;
}

function FilterAutoPan({ entities, searchTerm }: { entities: NgsiEntity[], searchTerm: string }) {
  const map = useMap();
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchTerm || !searchTerm.trim() || entities.length === 0) return;
      const target = entities[0];
      let position: [number, number] | null = null;
      if (Array.isArray(target.location) && target.location.length === 2 && typeof target.location[0] === 'number') {
           position = target.location as [number, number];
      } else if (target.location?.value?.type === 'Point') {
          const coords = target.location.value.coordinates;
          position = [coords[1], coords[0]];
      }
      if (position) map.flyTo(position, 16, { duration: 1.5 });
    }, 800);
    return () => clearTimeout(handler);
  }, [searchTerm, entities, map]);
  return null;
}

// --- CONFIG MÀU SẮC ---
const DOMAIN_CONFIG: Record<string, { color: string, icon: any }> = {
  weather: { color: '#f97316', icon: <CloudSun size={20} color="white" /> },
  air: { color: '#10b981', icon: <Wind size={20} color="white" /> },
  parking: { color: '#2563eb', icon: <Car size={18} color="white" /> },
  bus: { color: '#4f46e5', icon: <Bus size={20} color="white" /> },
  poi: { color: '#7c3aed', icon: <Store size={20} color="white" /> },
  traffic: { color: '#dc2626', icon: <Navigation size={20} color="white" /> },
  default: { color: '#4b5563', icon: <MapPin size={20} color="white" /> },
};

const getTypeDomain = (type: string, defaultDomain: string = 'default') => {
  const t = type.toLowerCase();
  if (t.includes('bus')) return 'bus';
  if (t.includes('air')) return 'air';
  if (t.includes('parking')) return 'parking';
  if (t.includes('weather')) return 'weather';
  if (t.includes('traffic')) return 'traffic';
  return defaultDomain;
};

const createCustomIcon = (domain: string, entity?: any) => {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.default;

  if (domain === 'parking' && entity) {
    const available = entity.availableSpotNumber?.value ?? entity.availableSpotNumber ?? 0;
    const bgColor = available === 0 ? '#ef4444' : (available < 10 ? '#f59e0b' : config.color); 

    const iconHtml = renderToStaticMarkup(
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: bgColor, padding: '4px 8px', borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        border: '2px solid white', minWidth: '50px', position: 'relative', transform: 'translateY(-10px)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {config.icon}
          <span style={{ color: 'white', fontWeight: '800', fontSize: '14px', lineHeight: '1', paddingTop: '1px' }}>
            {available}
          </span>
        </div>
        <div style={{
          position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
          width: '10px', height: '10px', backgroundColor: bgColor, borderRight: '2px solid white', borderBottom: '2px solid white', zIndex: -1
        }}></div>
      </div>
    );
    return L.divIcon({ html: iconHtml, className: '', iconSize: [60, 40], iconAnchor: [30, 40], popupAnchor: [0, -45] });
  }

  const iconHtml = renderToStaticMarkup(
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '40px', height: '40px', borderRadius: '50%', backgroundColor: config.color,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '2px solid white', position: 'relative'
    }}>
      {config.icon}
      <div style={{
        position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
        width: '12px', height: '12px', backgroundColor: config.color, borderRight: '2px solid white', borderBottom: '2px solid white', zIndex: -1
      }}></div>
    </div>
  );
  return L.divIcon({ html: iconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 44], popupAnchor: [0, -45] });
};

const searchResultIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.3))' }}>
      <MapPin size={48} color="#dc2626" fill="#fee2e2" strokeWidth={2} />
      <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', marginTop: '-8px' }}></div>
    </div>
  ),
  className: '', iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48]
});

function MapController({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, zoom || 16, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
}

export default function RealMap({ 
  domain = 'default', 
  searchTerm = '',
  onDataLoaded, 
  center, 
  zoom = 13,
  searchMarker, 
  routeCoordinates, 
  onSelectEntity,
  entities: externalEntities,
  onRouteFound 
}: RealMapProps) {
  
  const [internalEntities, setInternalEntities] = useState<NgsiEntity[]>([]);
  const [activeOwmLayer, setActiveOwmLayer] = useState<string | null>(null);

  const getValue = (prop: any) => {
    if (prop === undefined || prop === null) return 'N/A';
    if (typeof prop === 'object' && prop.value !== undefined) return prop.value;
    if (typeof prop === 'object' && Object.keys(prop).length === 0) return 'N/A';
    return prop;
  };

  const isExternalMode = !!externalEntities;
  const activeEntities = isExternalMode ? externalEntities : internalEntities;

  // [UPDATED] Tự động bật layer phù hợp khi chuyển Domain (Tabs)
  useEffect(() => {
    if (domain === 'weather') setActiveOwmLayer('precipitation_new'); // Mưa/Mây
    else if (domain === 'air') setActiveOwmLayer('wind_new'); // Gió (khuếch tán không khí)
    else setActiveOwmLayer(null);
  }, [domain]);

  const fetchEntities = async () => {
    if (isExternalMode || !domain || domain === 'default') return;

    if (onDataLoaded) onDataLoaded(0, true);
    try {
      let rawData: any[] = [];
      switch (domain) {
        case 'weather': rawData = (await ApiService.weather.getAll()).data; break;
        case 'air': rawData = (await ApiService.air.getAll()).data; break;
        case 'parking': rawData = (await ApiService.parking.getAll()).data; break;
        case 'bus': rawData = (await ApiService.bus.getAll()).data; break;
        case 'traffic': break; 
        default: break;
      }

      const normalizedData = rawData.map(item => {
          let displayType = item.type;
          if (domain === 'weather') displayType = 'Weather';
          else if (domain === 'air') displayType = 'AirQuality';
          else if (domain === 'parking') displayType = 'Parking';
          else if (domain === 'bus') displayType = 'BusStop';
          return { ...item, type: displayType };
      });

      setInternalEntities(normalizedData);
    } catch (error) {
      console.error("[RealMap] Lỗi thu thập dữ liệu:", error);
      setInternalEntities([]);
    }
  };

  useEffect(() => {
    if (isExternalMode) return;
    fetchEntities();
    if (!isExternalMode) {
        const interval = setInterval(fetchEntities, 30000);
        return () => clearInterval(interval);
    }
  }, [domain, isExternalMode]);

  const filteredEntities = useMemo(() => {
    let result = activeEntities || [];
    if (searchTerm && searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(entity => {
        const name = String(entity.name?.value || entity.name || '').toLowerCase(); 
        return name.includes(lowerTerm);
      });
    }
    if (onDataLoaded) onDataLoaded(result.length, false);
    return result;
  }, [activeEntities, searchTerm]);

  const validMarkers = useMemo(() => {
    if (!filteredEntities) return [];
    
    return filteredEntities.map((entity) => {
      let position: [number, number] | null = null;
      
      if (entity.location?.coordinates && Array.isArray(entity.location.coordinates)) {
           const coords = entity.location.coordinates;
           position = [coords[1], coords[0]];
      }
      else if (entity.location?.value?.coordinates && Array.isArray(entity.location.value.coordinates)) {
          const coords = entity.location.value.coordinates;
          position = [coords[1], coords[0]];
      }
      else if (Array.isArray(entity.location) && entity.location.length === 2 && typeof entity.location[0] === 'number') {
           position = entity.location as [number, number];
      }

      if (!position) return null;

      let rawAddress = '';
      if (typeof entity.address === 'string') rawAddress = entity.address;
      else if (entity.address?.value) {
          if (typeof entity.address.value === 'string') rawAddress = entity.address.value;
          else rawAddress = entity.address.value.streetAddress || entity.address.value.addressLocality || '';
      } 
      else if (typeof entity.address === 'object') rawAddress = entity.address.streetAddress || entity.address.addressLocality || '';

      if (!rawAddress || rawAddress === 'Unknown Street' || rawAddress === 'Unknown') rawAddress = 'Đang cập nhật';

      const displayName = getValue(entity.name) !== 'N/A' ? getValue(entity.name) : (entity.name || entity.id);
      const iconDomain = isExternalMode ? getTypeDomain(entity.type) : domain;
      const icon = createCustomIcon(iconDomain, entity);

      return {
        entity,
        position,
        icon,
        displayName,
        rawAddress,
        temperature: getValue(entity.temperature),
        availableSpots: getValue(entity.availableSpotNumber)
      };
    }).filter((item) => item !== null) as any[];
  }, [filteredEntities, domain, isExternalMode]);

  return (
    <div className="relative w-full h-full group">
        <MapContainer 
            center={center || [10.7769, 106.7009]} zoom={13} zoomControl={false} attributionControl={false}
            style={{ height: '100%', width: '100%', borderRadius: '0 0 14px 14px' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* [UPDATED] TileLayer ĐỘNG cho OpenWeatherMap */}
            {activeOwmLayer && (
                <TileLayer
                    url={`https://tile.openweathermap.org/map/${activeOwmLayer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`}
                    attribution='&copy; OpenWeatherMap'
                    zIndex={10}
                    opacity={0.7}
                />
            )}
            
            <MapController center={center} zoom={zoom} />
            <FilterAutoPan entities={filteredEntities} searchTerm={searchTerm} />
            
            <RoutingMachine 
                routeCoords={routeCoordinates} 
                onRouteFound={onRouteFound}
            />

            {searchMarker && (
                <Marker position={searchMarker} icon={searchResultIcon} zIndexOffset={1000} eventHandlers={{
                    click: () => {
                    if (onSelectEntity) {
                        const fakeEntity: NgsiEntity = {
                        id: 'search:result',
                        type: 'SearchResult',
                        name: { value: 'Vị trí tìm kiếm' },
                        location: {
                            type: 'GeoProperty',
                            value: { type: 'Point', coordinates: [searchMarker[1], searchMarker[0]] } 
                        },
                        address: {
                            value: { streetAddress: `Tọa độ: ${searchMarker[0].toFixed(4)}, ${searchMarker[1].toFixed(4)}` },
                        }
                        };
                        onSelectEntity(fakeEntity);
                    }
                    }
                }}>
                    <Popup className="custom-popup"><div className="font-bold text-red-600 text-sm p-1 text-center">📍 Vị trí tìm kiếm</div></Popup>
                </Marker>
            )}

            <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={false}
                maxClusterRadius={40}
                disableClusteringAtZoom={16}
            >
            {validMarkers.map(({ entity, position, icon, displayName, rawAddress, temperature, availableSpots }) => (
                <Marker 
                    key={entity.id} 
                    position={position} 
                    icon={icon}
                    eventHandlers={{ click: () => { if (onSelectEntity) onSelectEntity(entity); } }}
                >
                    <Popup className="custom-popup">
                    <div className="min-w-[200px] p-1 cursor-pointer" onClick={() => onSelectEntity && onSelectEntity(entity)}>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-blue-600">{displayName}</h3>
                        </div>
                        <div className="text-xs text-gray-500 mb-2 flex items-start gap-1.5">
                            <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                            <span className="italic leading-tight">{typeof rawAddress === 'string' ? rawAddress : formatAddress(rawAddress)}</span>
                            </div>
                        <div className="text-sm space-y-1">
                            {entity.type === 'Weather' && <p className="text-orange-600 font-bold">{temperature}°C</p>}
                            {entity.type === 'Parking' && <p className="text-blue-600 font-bold">Trống: {availableSpots}</p>}
                        </div>
                    </div>
                    </Popup>
                </Marker>
            ))}
            </MarkerClusterGroup>
        </MapContainer>

        {/* [NEW] THANH CÔNG CỤ ĐIỀU KHIỂN LAYER BÊN PHẢI */}
        <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-300">
            <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center justify-center cursor-default" title="Lớp bản đồ">
                <Layers className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="flex flex-col">
                <button
                    onClick={() => setActiveOwmLayer(null)}
                    className={`p-2.5 flex items-center justify-center transition-colors hover:bg-gray-100 border-b border-gray-100 ${!activeOwmLayer ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                    title="Tắt lớp phủ (None)"
                >
                    <EyeOff size={18} />
                </button>

                {OWM_LAYERS.map((layer) => (
                    <button
                        key={layer.id}
                        onClick={() => setActiveOwmLayer(layer.id)}
                        className={`p-2.5 flex items-center justify-center transition-all hover:bg-gray-100 relative group/btn ${activeOwmLayer === layer.id ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-inner' : 'text-gray-600'}`}
                    >
                        {layer.icon}
                        
                        {/* Tooltip khi hover */}
                        <span className="absolute right-full mr-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {layer.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}