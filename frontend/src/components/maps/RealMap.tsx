'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';

// Import Routing Machine
if (typeof window !== 'undefined') {
  require('leaflet-routing-machine');
}

import { renderToStaticMarkup } from 'react-dom/server';
import { 
  CloudSun, Wind, Car, Bus, MapPin, Navigation, Store
} from 'lucide-react';

// --- Interfaces ---
export interface NgsiEntity {
  id: string;
  type: string;
  location?: {
    type: 'GeoProperty';
    value: { type: 'Point'; coordinates: [number, number] };
  };
  address?: { value: any };
  name?: { value: any };
  [key: string]: any;
}

interface RealMapProps {
  domain: string;
  searchTerm: string;
  onDataLoaded?: (count: number, loading: boolean) => void;
  center?: [number, number];
  searchMarker?: [number, number] | null;
  
  // Props cho Routing
  routeCoordinates?: { start: [number, number]; end: [number, number] } | null;
  onSelectEntity?: (entity: NgsiEntity) => void; 
}

// --- Routing Component ---
function RoutingMachine({ routeCoords }: { routeCoords: { start: [number, number]; end: [number, number] } | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (!routeCoords || !map) return;

    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(routeCoords.start[0], routeCoords.start[1]),
        L.latLng(routeCoords.end[0], routeCoords.end[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] },
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      containerClassName: 'hidden', 
    }).addTo(map);

    return () => {
      if (map && routingControl) map.removeControl(routingControl);
    };
  }, [routeCoords, map]);

  return null;
}

// ... (Giữ nguyên CONFIG MÀU SẮC và HÀM TẠO ICON như cũ) ...
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
  useEffect(() => {
    if (center) map.flyTo(center, 16, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function RealMap({ domain, searchTerm, onDataLoaded, center, searchMarker, routeCoordinates, onSelectEntity }: RealMapProps) {
  const [entities, setEntities] = useState<NgsiEntity[]>([]);

  const fetchEntities = async () => {
    if (onDataLoaded) onDataLoaded(0, true);
    const apiDomain = domain === 'traffic' ? 'poi' : domain; 
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; 
      const apiUrl = `${baseUrl}/${apiDomain}/status`;
      
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API Error`);
      const data: NgsiEntity[] = await res.json();
      setEntities(data);
    } catch (error) {
      console.error("[RealMap] Fetch Failed:", error);
      setEntities([]);
    }
  };

  useEffect(() => {
    fetchEntities();
    const interval = setInterval(fetchEntities, 30000);
    return () => clearInterval(interval);
  }, [domain]);

  const filteredEntities = useMemo(() => {
    let result = entities;
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = entities.filter(entity => {
        const name = String(entity.name?.value || '').toLowerCase();
        return name.includes(lowerTerm);
      });
    }
    if (onDataLoaded) onDataLoaded(result.length, false);
    return result;
  }, [entities, searchTerm, onDataLoaded]);

  const getValue = (prop: any) => (prop && prop.value !== undefined ? prop.value : 'N/A');
  const currentIcon = useMemo(() => createCustomIcon(domain), [domain]);

  return (
    <MapContainer 
      center={center || [10.7769, 106.7009]} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '0 0 14px 14px' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <MapController center={center} />
      <RoutingMachine routeCoords={routeCoordinates} />

      {/* --- CẬP NHẬT PHẦN NÀY: MARKER TÌM KIẾM --- */}
      {searchMarker && (
        <Marker 
          position={searchMarker} 
          icon={searchResultIcon} 
          zIndexOffset={1000}
          eventHandlers={{
            click: () => {
              if (onSelectEntity) {
                // Tạo một entity "giả" để Sidebar có thể hiểu và hiển thị
                const fakeEntity: NgsiEntity = {
                  id: 'search:result',
                  type: 'SearchResult',
                  name: { value: 'Vị trí đã chọn' },
                  location: {
                    type: 'GeoProperty',
                    // Quan trọng: Leaflet dùng [Lat, Lng], nhưng GeoJSON dùng [Lng, Lat]. 
                    // Sidebar mong đợi GeoJSON để đảo ngược lại.
                    value: { type: 'Point', coordinates: [searchMarker[1], searchMarker[0]] } 
                  },
                  address: { value: { streetAddress: `Tọa độ: ${searchMarker[0].toFixed(4)}, ${searchMarker[1].toFixed(4)}` } }
                };
                onSelectEntity(fakeEntity); // Gửi về cha
              }
            }
          }}
        >
          <Popup className="custom-popup">
            <div 
              className="font-bold text-red-600 text-sm p-1 text-center cursor-pointer hover:underline"
              onClick={() => { /* Sự kiện click đã được handle ở Marker, onClick này để UX tốt hơn */ }}
            >
              📍 Vị trí tìm kiếm <br/>
              <span className="text-xs text-gray-500 font-normal no-underline">Bấm để chỉ đường</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marker Cảm biến */}
      {filteredEntities.map((entity) => {
        const loc = entity.location?.value;
        if (!loc || loc.type !== 'Point') return null;
        const position: [number, number] = [loc.coordinates[1], loc.coordinates[0]];

        return (
          <Marker 
            key={entity.id} 
            position={position} 
            icon={currentIcon}
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
                      {getValue(entity.name) !== 'N/A' ? getValue(entity.name) : entity.id.split(':').pop()}
                    </h3>
                  </div>
                  <div className="text-sm space-y-1">
                     {domain === 'weather' && <p className="text-orange-600 font-bold">{getValue(entity.temperature)}°C</p>}
                     {domain === 'parking' && <p className="text-blue-600 font-bold">Trống: {getValue(entity.availableSpotNumber)}</p>}
                     <p className="text-xs text-gray-500 truncate">Bấm để chọn địa điểm này</p>
                  </div>
               </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}