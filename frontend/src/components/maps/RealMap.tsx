'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const createCustomIcon = (IconComponent: any, colorClass: string, bgColorClass: string) => {
  const getColor = (cls: string) => {
    if (cls.includes('blue')) return '#3b82f6';
    if (cls.includes('red')) return '#ef4444';
    if (cls.includes('green')) return '#22c55e';
    if (cls.includes('purple')) return '#a855f7';
    if (cls.includes('orange')) return '#f97316';
    return '#3b82f6';
  };

  const bgHex = getColor(colorClass);
  
  const iconHtml = renderToStaticMarkup(
    <div style={{
      backgroundColor: 'white',
      border: `2px solid ${bgHex}`,
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ color: bgHex, display: 'flex' }}>
        <IconComponent size={20} />
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Component để bản đồ tự bay đến vị trí mới khi tìm kiếm
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 2 }); // Zoom sâu hơn (16) khi tìm thấy
    }
  }, [center, map]);
  return null;
}

interface RealMapProps {
  entities: any[];
  selectedEntity: any;
  onSelectEntity: (entity: any) => void;
  center: [number, number]; // Thêm prop center động
}

export default function RealMap({ entities, selectedEntity, onSelectEntity, center }: RealMapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={14} 
      style={{ height: '100%', width: '100%', borderRadius: '14px' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {entities.map((entity) => (
        <Marker
          key={entity.id}
          position={entity.location}
          icon={createCustomIcon(entity.icon, entity.color, entity.bgColor)}
          eventHandlers={{
            click: () => onSelectEntity(entity),
          }}
        >
          <Popup className="custom-popup">
            <div className="font-medium text-sm">{entity.name}</div>
            <div className="text-xs text-gray-500">{entity.distance} km</div>
          </Popup>
        </Marker>
      ))}
      
      {/* Marker vị trí tìm kiếm */}
      <Marker position={center} icon={L.divIcon({
          html: '<div style="width: 12px; height: 12px; background: red; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(255,0,0,0.2)"></div>',
          className: 'center-marker',
          iconSize: [12, 12]
      })} />

    </MapContainer>
  );
}