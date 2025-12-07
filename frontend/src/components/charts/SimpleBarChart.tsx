/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useState } from 'react';

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
  
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const allValues = bars.flatMap(bar => 
    data.map(d => Number(d[bar.dataKey]) || 0)
  );
  const maxValue = Math.max(...allValues, 1);
  const gridLineCount = 5;
  const gridValues = Array.from({ length: gridLineCount }, (_, i) => {
    const value = (maxValue / (gridLineCount - 1)) * i;
    return Math.round(value);
  });

  const barGroupWidth = innerWidth / data.length;
  const barWidth = barGroupWidth / (bars.length + 1);

  const yScale = (value: number) => {
    const normalized = value / maxValue;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  return (
    <div className="w-full relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {gridValues.map((value, i) => {
          const y = yScale(value);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#cccccc"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y}
                fill="#666666"
                fontSize="12"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding.left + i * barGroupWidth + barGroupWidth / 2;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight - padding.bottom + 20}
              fill="#666666"
              fontSize="12"
              textAnchor="middle"
            >
              {String(d[xAxisKey])}
            </text>
          );
        })}

        {/* Bars */}
        {data.map((d, dataIndex) => {
          return bars.map((bar, barIndex) => {
            const value = Number(d[bar.dataKey]) || 0;
            const x = padding.left + dataIndex * barGroupWidth + barIndex * barWidth + barWidth / 2;
            const y = yScale(value);
            const barHeight = padding.top + innerHeight - y;
            const isHovered = hoveredBar?.index === dataIndex && hoveredBar?.bar === bar.dataKey;

            return (
              <g key={`${dataIndex}-${barIndex}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={bar.fill}
                  opacity={isHovered ? 0.8 : 1}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredBar({ index: dataIndex, bar: bar.dataKey })}
                  onMouseLeave={() => setHoveredBar(null)}
                  rx={2}
                />
                {isHovered && (
                  <text
                    x={x + (barWidth * 0.8) / 2}
                    y={y - 5}
                    fill="#666666"
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="bold"
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
      <div className="flex items-center justify-center gap-4 mt-4">
        {bars.map((bar) => (
          <div key={bar.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: bar.fill }}
            />
            <span className="text-gray-600">{bar.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
