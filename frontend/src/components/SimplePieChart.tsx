'use client';

import { useState } from 'react';

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
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  
  if (!data || data.length === 0) return null;

  const chartSize = height;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = Math.min(chartSize / 2.5, 100);

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles
  let currentAngle = -90; // Start from top
  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      percentage: percentage * 100,
      color: colors[index % colors.length]
    };
  });

  // Convert polar to cartesian
  const polarToCartesian = (angle: number, r: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(radian),
      y: centerY + r * Math.sin(radian)
    };
  };

  // Create path for slice
  const createSlicePath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerR === 0) {
      // Regular pie
      return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    } else {
      // Donut
      const innerStart = polarToCartesian(startAngle, innerR);
      const innerEnd = polarToCartesian(endAngle, innerR);
      return `M ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`;
    }
  };

  return (
    <div className="w-full flex flex-col items-center" style={{ height }}>
      <svg
        viewBox={`0 0 ${chartSize} ${chartSize}`}
        className="w-full max-w-xs"
        style={{ maxHeight: height - 50 }}
      >
        {slices.map((slice, index) => {
          const isHovered = hoveredSlice === index;
          const currentRadius = isHovered ? radius + 5 : radius;
          
          return (
            <g key={index}>
              <path
                d={createSlicePath(slice.startAngle, slice.endAngle, currentRadius, innerRadius)}
                fill={slice.color}
                stroke="white"
                strokeWidth={2}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  opacity: isHovered ? 0.8 : 1
                }}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              
              {/* Label */}
              {slice.percentage > 5 && (
                <text
                  x={polarToCartesian((slice.startAngle + slice.endAngle) / 2, radius * 0.7).x}
                  y={polarToCartesian((slice.startAngle + slice.endAngle) / 2, radius * 0.7).y}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {slice.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-xs">
        {slices.map((slice, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 text-sm cursor-pointer"
            onMouseEnter={() => setHoveredSlice(index)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-gray-600 truncate">
              {slice.name}: {slice.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
