/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState, useMemo } from 'react';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface SimplePieChartProps {
  data: DataPoint[];
  colors?: string[];
  height?: number;
  innerRadius?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export function SimplePieChart({ 
  data, 
  colors = DEFAULT_COLORS,
  height = 250,
  innerRadius = 0 
}: SimplePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const size = height;
  const center = size / 2;
  const outerRadius = Math.min(size / 2.2, 100); 

  const chartSize = height;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = Math.min(chartSize / 2.5, 100);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  

  let currentAngle = -90; 
  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return data.map((item, index) => {
      const percentage = total === 0 ? 0 : item.value / total;
      const angleSpan = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      
      currentAngle = endAngle;

      return {
        ...item,
        percentage: percentage * 100,
        startAngle,
        endAngle,
        color: colors[index % colors.length],
        midAngle: startAngle + angleSpan / 2
      };
    });
  }, [data, colors]);

  // Helper: Chuyển đổi tọa độ cực sang tọa độ Descartes
  const getCoordinates = (angleInDegrees: number, radius: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      ...item,
      startAngle,
      endAngle,
      percentage: percentage * 100,
      color: colors[index % colors.length]
    };
  });

  const polarToCartesian = (angle: number, r: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(radian),
      y: centerY + r * Math.sin(radian)
    };
  };

  const createSlicePath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerR === 0) {

      return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    } else {

      const innerStart = polarToCartesian(startAngle, innerR);
      const innerEnd = polarToCartesian(endAngle, innerR);
      return `M ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`;
    }

    const startInner = getCoordinates(startAngle, innerR);
    const endInner = getCoordinates(endAngle, innerR);

    return [
      `M ${start.x} ${start.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${endInner.x} ${endInner.y}`, 
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`, 
      `Z`
    ].join(" ");
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          const currentOuterRadius = isHovered ? outerRadius + 6 : outerRadius;
          
          return (
            <g 
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <path
                d={createPath(slice.startAngle, slice.endAngle, currentOuterRadius, innerRadius)}
                fill={slice.color}
                stroke="white"
                strokeWidth={2}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              />
              
              {slice.percentage > 5 && (
                <text
                  x={getCoordinates(slice.midAngle, innerRadius + (outerRadius - innerRadius) / 2).x}
                  y={getCoordinates(slice.midAngle, innerRadius + (outerRadius - innerRadius) / 2).y}
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {Math.round(slice.percentage)}%
                </text>
              )}
            </g>
          );
        })}

        {/* Trung tâm (nếu muốn hiển thị tổng số cho Donut) */}
        {innerRadius > 0 && (
           <text
             x={center}
             y={center}
             textAnchor="middle"
             dominantBaseline="middle"
             className="text-gray-500 text-xs font-medium"
           >
             Total
           </text>
        )}
      </svg>

      {/* Tooltip nổi (Vị trí tuyệt đối theo miếng bánh đang hover) */}
      {hoveredIndex !== null && (
        <div
          className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-2 text-xs pointer-events-none z-10 flex flex-col items-center"
          style={{
            left: getCoordinates(slices[hoveredIndex].midAngle, outerRadius).x,
            top: getCoordinates(slices[hoveredIndex].midAngle, outerRadius).y,
            transform: 'translate(-50%, -120%)', // Đẩy lên trên điểm hover
            whiteSpace: 'nowrap'
          }}
        >
          <span className="font-bold text-gray-800">{slices[hoveredIndex].name}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-gray-600">{slices[hoveredIndex].value}</span>
            <span className="font-bold" style={{ color: slices[hoveredIndex].color }}>
              ({slices[hoveredIndex].percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Legend (Chú thích bên dưới) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full max-w-xs">
        {slices.map((slice, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity ${
              hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-gray-600 truncate font-medium">
              {slice.name}
            </span>
            <span className="text-gray-400 ml-auto">
              {slice.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}