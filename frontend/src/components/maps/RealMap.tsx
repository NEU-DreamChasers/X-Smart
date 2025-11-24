'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react'; // Import thêm icon mặc định

// Hàm tạo Icon (Đã tối ưu để hỗ trợ nhiều loại màu)
const createCustomIcon = (IconComponent: any, colorClass: string) => {
  const getColor = (cls: string) => {
    if (!cls) return '#3b82f6';
    if (cls.includes('blue')) return '#3b82f6';
    if (cls.includes('red')) return '#ef4444';
    if (cls.includes('green')) return '#22c55e';
    if (cls.includes('purple')) return '#a855f7';
    if (cls.includes('orange')) return '#f97316';
    if (cls.includes('yellow')) return '#eab308';
    if (cls.includes('gray')) return '#6b7280';
    return '#3b82f6';
  };

  const bgHex = getColor(colorClass);
  
  const iconHtml = renderToStaticMarkup(
    <div style={{
      backgroundColor: 'white',
      border: `2px solid ${bgHex}`,
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ color: bgHex, display: 'flex' }}>
        {/* Fallback về MapPin nếu không có IconComponent */}
        {IconComponent ? <IconComponent size={18} /> : <MapPin size={18} />}
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component điều khiển Camera
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Dùng flyTo cho mượt mà
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Định nghĩa Props linh hoạt hơn (Optional ?)
interface RealMapProps {
  entities: any[];
  selectedEntity?: any;           // Đã đổi thành optional (?)
  onSelectEntity?: (entity: any) => void; // Đã đổi thành optional (?)
  center?: [number, number];      // Đã đổi thành optional (?)
  zoom?: number;                  // Thêm prop zoom
}

const defaultCenter: [number, number] = [10.7721, 106.6983]; // Chợ Bến Thành

export default function RealMap({ 
  entities, 
  selectedEntity, 
  onSelectEntity, 
  center = defaultCenter, 
  zoom = 14 
}: RealMapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '14px' }}
      zoomControl={false}
    >
      {/* Tile Layer của OpenStreetMap */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} zoom={zoom} />

      {entities.map((entity) => (
        <Marker
          key={entity.id}
          position={entity.location}
          icon={createCustomIcon(entity.icon, entity.color)}
          eventHandlers={{
            click: () => onSelectEntity && onSelectEntity(entity),
          }}
        >
          <Popup className="custom-popup">
            <div className="font-bold text-sm">{entity.name}</div>
            <div className="text-xs text-gray-600">{entity.type}</div>
            {entity.distance && (
                <div className="text-xs text-gray-500 mt-1">Cách {entity.distance} km</div>
            )}
          </Popup>
        </Marker>
      ))}
      
      {/* Marker trung tâm (chỉ hiện khi đang tìm kiếm cụ thể bên trang Citizen) */}
      {selectedEntity === null && center !== defaultCenter && (
        <Marker position={center} icon={L.divIcon({
            html: '<div style="width: 12px; height: 12px; background: red; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(255,0,0,0.2)"></div>',
            className: 'center-marker',
            iconSize: [12, 12]
        })} />
      )}

    </MapContainer>
  );
}