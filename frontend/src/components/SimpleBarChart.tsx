/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState, useMemo } from 'react';

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  fill: string;
  name: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  xAxisKey: string;
  bars: BarConfig[];
  height?: number;
}

export function SimpleBarChart({ data, xAxisKey, bars, height = 250 }: SimpleBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{ index: number; bar: string } | null>(null);


  const chartWidth = 600;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;


  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100;
    const allValues = bars.flatMap(bar => data.map(d => Number(d[bar.dataKey]) || 0));
    const rawMax = Math.max(...allValues, 1);
    return rawMax * 1.1;
  }, [data, bars]);


  const bandWidth = innerWidth / data.length; 
  // Mỗi nhóm cột chiếm 60% không gian, còn lại là khoảng trống
  const barGroupWidth = bandWidth * 0.6; 
  // Chiều rộng mỗi cột đơn lẻ
  const barWidth = barGroupWidth / bars.length;

  // Helper scales
  const xScale = (index: number) => {
    // Trả về điểm giữa của band
    return padding.left + (index * bandWidth) + (bandWidth / 2);
  };

  const yScale = (value: number) => {
    const normalized = value / maxValue;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // Grid Lines
  const gridValues = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => (maxValue / (count - 1)) * i);
  }, [maxValue]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        Chưa có dữ liệu biểu đồ
      </div>
    );
  }

  return (
    <div className="w-full relative select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines & Y-Axis Labels */}
        {gridValues.map((value, i) => {
          const y = yScale(value);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const showLabel = data.length < 15 || i % Math.ceil(data.length / 8) === 0;
          if (!showLabel) return null;

          const x = xScale(i);
          return (
            <text
              key={i}
              x={x}
              y={height - 5}
              fill="#6b7280"
              fontSize="10"
              textAnchor="middle"
            >
              {String(d[xAxisKey])}
            </text>
          );
        })}

        {/* Bars */}
        {data.map((d, dataIndex) => {

          const groupStartX = xScale(dataIndex) - (barGroupWidth / 2);

          return bars.map((bar, barIndex) => {
            const value = Number(d[bar.dataKey]) || 0;
            
            const x = groupStartX + (barIndex * barWidth);
            const y = yScale(value);
            const barH = (padding.top + innerHeight) - y;
            
            const isHovered = hoveredBar?.index === dataIndex && hoveredBar?.bar === bar.dataKey;

            return (
              <g key={`${dataIndex}-${barIndex}`} onMouseEnter={() => setHoveredBar({ index: dataIndex, bar: bar.dataKey })} onMouseLeave={() => setHoveredBar(null)}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(1, barWidth - 2)} 
                  height={Math.max(0, barH)} 
                  fill={bar.fill}
                  opacity={isHovered ? 0.8 : 1}
                  rx={2} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Tooltip giá trị khi hover (Hiện ngay trên đầu cột) */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    fill="#4b5563"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {bars.map((bar) => (
          <div key={bar.dataKey} className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: bar.fill }}
            />
            <span>{bar.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}