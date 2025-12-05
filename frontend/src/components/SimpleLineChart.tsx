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

interface LineConfig {
  dataKey: string;
  stroke: string;
  name: string;
  strokeWidth?: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  xAxisKey: string;
  lines: LineConfig[];
  height?: number;
}

export function SimpleLineChart({ data, xAxisKey, lines, height = 250 }: SimpleLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; line: string } | null>(null);

  const chartWidth = 600;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const { min, max, valueRange } = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 100, valueRange: 100 };
    
    const allValues = lines.flatMap(line => 
      data.map(d => Number(d[line.dataKey]) || 0)
    );
    
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    
    const buffer = (rawMax - rawMin) * 0.1 || 5;
    
    return {
      min: rawMin - buffer,
      max: rawMax + buffer,
      valueRange: (rawMax + buffer) - (rawMin - buffer) || 1
    };
  }, [data, lines]);

  // Helper scales
  const xScale = (index: number) => {
    return padding.left + (index / (data.length - 1 || 1)) * innerWidth;
  };

  const yScale = (value: number) => {
    const normalized = (value - min) / valueRange;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // 2. Tính toán đường dẫn (Path) và Grid
  const gridValues = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      return min + (valueRange / (count - 1)) * i;
    });
  }, [min, valueRange]);

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

        {/* X-axis labels (Chỉ hiện điểm đầu, giữa, cuối để đỡ rối nếu nhiều data) */}
        {data.map((d, i) => {
          const showLabel = data.length < 10 || i % Math.ceil(data.length / 5) === 0;
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

        {/* Lines & Dots */}
        {lines.map((line, lineIndex) => {
           const pathD = data.map((d, i) => {
             const x = xScale(i);
             const y = yScale(Number(d[line.dataKey]) || 0);
             return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
           }).join(' ');

           return (
            <g key={lineIndex}>
              <path
                d={pathD}
                fill="none"
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                strokeOpacity={0.2}
                strokeLinecap="round"
                transform="translate(0, 2)"
              />
              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Interactive Dots (Vùng hover rộng hơn chấm hiển thị) */}
              {data.map((d, i) => {
                const x = xScale(i);
                const y = yScale(Number(d[line.dataKey]) || 0);
                const isHovered = hoveredPoint?.index === i;

                return (
                  <g key={i} onMouseEnter={() => setHoveredPoint({ index: i, line: line.dataKey })}>
                    {/* Vùng tàng hình để dễ hover */}
                    <circle cx={x} cy={y} r={15} fill="transparent" />
                    
                    {/* Chấm hiển thị */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill="white"
                      stroke={line.stroke}
                      strokeWidth={2}
                      style={{ transition: 'r 0.2s' }}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Tooltip - ĐÃ SỬA LOGIC VỊ TRÍ */}
      {hoveredPoint && (
        <div
          className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-2 text-xs pointer-events-none z-10"
          style={{
            left: `${(xScale(hoveredPoint.index) / chartWidth) * 100}%`,
            top: '0',
            transform: 'translate(-50%, -100%) translateY(-10px)',
            whiteSpace: 'nowrap'
          }}
        >
          <div className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">
            {String(data[hoveredPoint.index][xAxisKey])}
          </div>
          {lines.map((line) => (
            <div key={line.dataKey} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line.stroke }} />
              <span className="text-gray-500">{line.name}:</span>
              <span className="font-mono font-bold text-gray-900">
                {String(data[hoveredPoint.index][line.dataKey])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}