'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

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
  location?: {
    type: 'GeoProperty';
    value: { type: 'Point'; coordinates: [number, number] };
  };
  address?: any;
  name?: { value: any } | any;
  [key: string]: any;
}

interface RealMapProps {
  domain: string;
  searchTerm: string;
  onDataLoaded?: (count: number, loading: boolean) => void;
  center?: [number, number];
  searchMarker?: [number, number] | null;
  routeCoordinates?: { start: [number, number]; end: [number, number] } | null;
  onSelectEntity?: (entity: NgsiEntity) => void; 
  zoom?: number;
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
    if (!L.Routing) return;
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
  parking: { color: '#2563eb', icon: <Car size={20} color="white" /> },
  bus: { color: '#4f46e5', icon: <Bus size={20} color="white" /> },
  poi: { color: '#7c3aed', icon: <Store size={20} color="white" /> },
  traffic: { color: '#dc2626', icon: <Navigation size={20} color="white" /> },
  default: { color: '#4b5563', icon: <MapPin size={20} color="white" /> },
};

const createCustomIcon = (domain: string) => {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.default;
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

export default function RealMap({ domain, searchTerm ='', onDataLoaded, center, searchMarker, routeCoordinates, onSelectEntity, entities: propEntities }: RealMapProps) {
  const [internalEntities, setInternalEntities] = useState<NgsiEntity[]>([]);

  const entitiesToRender = propEntities || internalEntities;

  const fetchEntities = async () => {
    if (onDataLoaded) onDataLoaded(0, true);
    const apiDomain = domain === 'traffic' ? 'poi' : domain; 
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; 
      const apiUrl = `${baseUrl}/${apiDomain}/status`;
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API Error`);
      const data: NgsiEntity[] = await res.json();
      setInternalEntities(data);
    } catch (error) {
      console.error("[RealMap] Fetch Failed:", error);
      setInternalEntities([]);
    }
  };

  useEffect(() => {
    if (propEntities) return;
    fetchEntities();
    const interval = setInterval(fetchEntities, 30000);
    return () => clearInterval(interval);
  }, [domain, propEntities]);

  const filteredEntities = useMemo(() => {
    let result = entitiesToRender;
    if (searchTerm && searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = entitiesToRender.filter(entity => {
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
    return prop;
  };
  
  // Helper get Safe Address
  const getSafeAddress = (entity: NgsiEntity) => {
    const val = entity.address?.value?.streetAddress || entity.address?.value || entity.address;
    return formatAddress(val);
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

      <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom={false} maxClusterRadius={40} disableClusteringAtZoom={16}>
        {filteredEntities.map((entity) => {
          let position: [number, number] | null = null;
          if (Array.isArray(entity.location) && entity.location.length === 2 && typeof entity.location[0] === 'number') {
             position = (entity.location as unknown) as [number, number];
          } else if (entity.location?.value?.type === 'Point') {
             const coords = entity.location.value.coordinates;
             position = [coords[1], coords[0]];
          }
          if (!position) return null;
          
          let itemDomain = domain;
          
          if (entity.type === 'BusStop') itemDomain = 'bus';
          else if (entity.type === 'Parking') itemDomain = 'parking';
          else if (entity.type === 'AirQuality') itemDomain = 'air';
          else if (entity.type === 'Weather') itemDomain = 'weather';
          
          // Tạo icon tương ứng
          const itemIcon = createCustomIcon(itemDomain);

          return (
            <Marker key={entity.id} position={position} icon={itemIcon} eventHandlers={{
                click: () => { if (onSelectEntity) onSelectEntity(entity); }
            }}>
              <Popup className="custom-popup">
                 <div className="min-w-[220px] p-1 cursor-pointer" onClick={() => onSelectEntity && onSelectEntity(entity)}>
                    {/* 1. Header Name */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-blue-600">
                        {getValue(entity.name) !== 'N/A' ? getValue(entity.name) : entity.id.split(':').pop()}
                      </h3>
                    </div>
                    
                    {/* 2. Address */}
                    <div className="text-xs text-gray-500 mb-3 flex items-start gap-1.5">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                        <span className="italic leading-tight line-clamp-2">{getSafeAddress(entity)}</span>
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