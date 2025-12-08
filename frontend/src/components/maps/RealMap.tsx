/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ApiService } from '@/services/api.service';

if (typeof window !== 'undefined') {
  require('leaflet-routing-machine');
}

import { renderToStaticMarkup } from 'react-dom/server';
import { 
  CloudSun, Wind, Car, Bus, MapPin, Navigation, Store, 
  Thermometer, Droplets
} from 'lucide-react';
import { formatAddress } from '@/lib/utils';

// Fix lỗi SSR cho Routing Machine
if (typeof window !== 'undefined') {
  try {
    require('leaflet-routing-machine');
  } catch (e) { console.error(e); }
}

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
}

// --- 1. HÀM TẠO TÊN TIẾNG VIỆT THÔNG MINH (NÂNG CẤP) ---
const getSmartName = (entity: NgsiEntity) => {
  let rawName = entity.name?.value || entity.name || '';

  const badKeywords = [
    'urn:ngsi-ld',
    'OpenWeatherMap',
    'Lat', 'Lon',
    'Public Parking',
    'Unknown',
    'N/A'
  ];

  const isBadName = badKeywords.some(kw => rawName.includes(kw));

  let typeVN = 'Điểm giám sát';
  if (entity.type?.includes('Weather')) typeVN = 'Trạm Thời tiết';
  else if (entity.type?.includes('Air')) typeVN = 'Trạm Không khí';
  else if (entity.type?.includes('Parking') || entity.type === 'OffStreetParking') typeVN = 'Bãi đỗ xe';
  else if (entity.type?.includes('Bus') || entity.category?.value?.includes('bus')) typeVN = 'Trạm Xe buýt';

  if (rawName.includes('Weather - ')) return rawName.replace('Weather - ', 'Thời tiết khu vực ');
  if (rawName.includes('Air Monitor - ')) return rawName.replace('Air Monitor - ', 'Không khí khu vực ');
  
  if (isBadName) {
     const addr = entity.address?.value || entity.address;
     
     if (addr?.streetAddress && addr.streetAddress !== 'Unknown Street') {
        return `${typeVN} ${addr.streetAddress}`;
     }
     if (addr?.addressLocality) {
        return `${typeVN} tại ${addr.addressLocality}`;
     }
     return `${typeVN} #${entity.id.split(':').pop()?.substring(0, 5)}`;
  }

  return rawName;
};

// --- Routing Component ---
function RoutingMachine({ routeCoords }: { routeCoords: { start: [number, number]; end: [number, number] } | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!routeCoords || !map) return;
    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [ L.latLng(routeCoords.start[0], routeCoords.start[1]), L.latLng(routeCoords.end[0], routeCoords.end[1]) ],
      routeWhileDragging: false, showAlternatives: false, fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] },
      createMarker: () => null, addWaypoints: false, draggableWaypoints: false, containerClassName: 'hidden', 
    }).addTo(map);
    // @ts-ignore
    return () => { try { if (map && routingControl) map.removeControl(routingControl); } catch(e){} };
  }, [routeCoords, map]);
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        padding: '4px 8px',
        borderRadius: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        border: '2px solid white',
        minWidth: '50px',
        position: 'relative',
        transform: 'translateY(-10px)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {config.icon}
          <span style={{ 
            color: 'white', 
            fontWeight: '800', 
            fontSize: '14px',
            lineHeight: '1',
            paddingTop: '1px' 
          }}>
            {available}
          </span>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: '10px',
          height: '10px',
          backgroundColor: bgColor,
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          zIndex: -1
        }}></div>
      </div>
    );
    return L.divIcon({ html: iconHtml, className: '', iconSize: [60, 40], iconAnchor: [30, 40], popupAnchor: [0, -45] });
  }

  const iconHtml = renderToStaticMarkup(
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '40px', height: '40px', borderRadius: '50%',
      backgroundColor: config.color,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '2px solid white', position: 'relative'
    }}>
      {config.icon}
      <div style={{
        position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
        width: '12px', height: '12px', backgroundColor: config.color,
        borderRight: '2px solid white', borderBottom: '2px solid white', zIndex: -1
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

function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 16, { duration: 1.5 }); }, [center, map]);
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
  entities: externalEntities 
}: RealMapProps) {
  
  const [internalEntities, setInternalEntities] = useState<NgsiEntity[]>([]);

  const isExternalMode = !!externalEntities;
  const activeEntities = isExternalMode ? externalEntities : internalEntities;

  const fetchEntities = async () => {
    if (isExternalMode || !domain || domain === 'default') return;

    if (onDataLoaded) onDataLoaded(0, true);
    try {
      let rawData: any[] = [];

      switch (domain) {
        case 'weather':
          const resWeather = await ApiService.weather.getAll();
          rawData = resWeather.data;
          break;
        case 'air':
          const resAir = await ApiService.air.getAll();
          rawData = resAir.data;
          break;
        case 'parking':
          const resParking = await ApiService.parking.getAll();
          rawData = resParking.data;
          break;
        case 'bus':
          const resBus = await ApiService.bus.getAll();
          rawData = resBus.data;
          break;
        case 'traffic': 
           break; 
        default:
          break;
      }

      const normalizedData = rawData.map(item => {
          let displayType = item.type;
          
          if (domain === 'weather') displayType = 'Weather';
          else if (domain === 'air') displayType = 'AirQuality';
          else if (domain === 'parking') displayType = 'Parking';
          else if (domain === 'bus') displayType = 'BusStop';

          return {
              ...item,
              type: displayType,
          };
      });

      setInternalEntities(normalizedData);
    } catch (error) {
      console.error("[RealMap] Lỗi thu thập dữ liệu:", error);
      setInternalEntities([]);
    }
  };

  useEffect(() => {
    if (propEntities) return;
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
  }, [entitiesToRender, searchTerm, onDataLoaded]);

  const getValue = (prop: any) => {
  if (prop === undefined || prop === null) return 'N/A';
  if (typeof prop === 'object' && prop.value !== undefined) return prop.value;
  if (typeof prop === 'object' && Object.keys(prop).length === 0) return 'N/A';
  return prop;
};

  return (
    <MapContainer 
      center={center || [10.7769, 106.7009]} zoom={13} zoomControl={false} attributionControl={false}
      style={{ height: '100%', width: '100%', borderRadius: '0 0 14px 14px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController center={center} />
      <RoutingMachine routeCoords={routeCoordinates} />

      {searchMarker && (
        <Marker position={searchMarker} icon={searchResultIcon} zIndexOffset={1000} eventHandlers={{
            click: () => {
              if (onSelectEntity) {
                onSelectEntity({
                  id: 'search:result', type: 'SearchResult', name: { value: 'Vị trí tìm kiếm' },
                  location: { type: 'GeoProperty', value: { type: 'Point', coordinates: [searchMarker[1], searchMarker[0]] } },
                  address: { value: { streetAddress: `Tọa độ: ${searchMarker[0].toFixed(4)}, ${searchMarker[1].toFixed(4)}` } }
                }); 
              }
            }
          }}
        >
          <Popup className="custom-popup"><div className="font-bold text-red-600 text-sm p-1 text-center">📍 Vị trí tìm kiếm</div></Popup>
        </Marker>
      )}

      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={false}
        maxClusterRadius={40}
        disableClusteringAtZoom={16}
      >
      {filteredEntities.map((entity) => {
        let position: [number, number] | null = null;
        
        if (entity.location?.coordinates && Array.isArray(entity.location.coordinates)) {
             const coords = entity.location.coordinates;
             position = [coords[1], coords[0]];
        }
        // Case 2: Dữ liệu thô NGSI-LD (chưa qua Service) -> location.value.coordinates
        else if (entity.location?.value?.coordinates && Array.isArray(entity.location.value.coordinates)) {
            const coords = entity.location.value.coordinates;
            position = [coords[1], coords[0]];
        }
        // Case 3: Dữ liệu AdminMap (đã xử lý thành mảng phẳng [Lat, Lon])
        else if (Array.isArray(entity.location) && entity.location.length === 2 && typeof entity.location[0] === 'number') {
             position = entity.location as [number, number];
        }

        if (!position) return null;

        const rawAddress = entity.address?.value?.streetAddress || entity.address?.value || entity.address || 'Đang cập nhật';
        const displayName = getValue(entity.name) !== 'N/A' ? getValue(entity.name) : (entity.name || entity.id);

        const iconDomain = isExternalMode ? getTypeDomain(entity.type) : domain;
        
        // --- UPDATE: Truyền entity vào createCustomIcon ---
        const icon = createCustomIcon(iconDomain, entity);

        return (
          <Marker 
            key={entity.id} 
            position={position} 
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onSelectEntity) onSelectEntity(entity);
              }
            }}
          >
            <Popup className="custom-popup">
               <div className="min-w-[200px] p-1 cursor-pointer" onClick={() => onSelectEntity && onSelectEntity(entity)}>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-blue-600">
                      {displayName}
                    </h3>
                  </div>

                  <div className="text-xs text-gray-500 mb-2 flex items-start gap-1.5">
                       <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                       <span className="italic leading-tight">
                         {typeof rawAddress === 'string' ? rawAddress : formatAddress(rawAddress)}
                       </span>
                    </div>

                    {/* 3. UI Style 'CitizenEnvironment' (Mini Cards) */}
                    <div className="text-sm space-y-2">
                        {/* STYLE CHO WEATHER */}
                        {(domain === 'weather' || entity.type.includes('Weather')) && (
                          <div className="grid grid-cols-2 gap-2">
                             <div className="bg-[#ffedd4] p-2 rounded-lg flex items-center gap-2 border border-orange-100">
                                <Thermometer size={16} className="text-[#f54900]" />
                                <span className="text-[#f54900] font-bold text-sm">{getValue(entity.temperature)}°C</span>
                             </div>
                             <div className="bg-[#cefafe] p-2 rounded-lg flex items-center gap-2 border border-blue-100">
                                <Droplets size={16} className="text-[#0092b8]" />
                                <span className="text-[#0092b8] font-bold text-sm">{getValue(entity.humidity) !== 'N/A' ? getValue(entity.humidity) : getValue(entity.relativeHumidity)}%</span>
                             </div>
                          </div>
                        )}

                        {/* STYLE CHO AIR */}
                        {(domain === 'air' || entity.type.includes('Air')) && (
                          <div className="bg-[#dcfce7] p-2 rounded-lg flex items-center justify-between border border-green-100">
                             <div className="flex items-center gap-2">
                                <Wind size={16} className="text-[#166534]" />
                                <span className="text-[#166534] font-bold text-sm">AQI</span>
                             </div>
                             <span className="text-[#166534] font-b old text-lg">{getValue(entity.airQualityIndex)}</span>
                          </div>
                        )}

                        {/* STYLE CHO PARKING */}
                        {(domain === 'parking' || entity.type.includes('Parking')) && (
                          <div className="bg-[#dbeafe] p-2 rounded-lg flex items-center justify-between border border-blue-100">
                             <div className="flex items-center gap-2">
                                <Car size={16} className="text-[#1e40af]" />
                                <span className="text-[#1e40af] font-medium text-xs">Chỗ trống</span>
                             </div>
                             <span className="text-[#1e40af] font-bold text-lg">{getValue(entity.availableSpotNumber)}</span>
                          </div>
                        )}

                    </div>
                 </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}