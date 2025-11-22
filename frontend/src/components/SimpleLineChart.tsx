'use client';

import { useState } from 'react';

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
  
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Get all numeric values to determine min/max
  const allValues = lines.flatMap(line => 
    data.map(d => Number(d[line.dataKey]) || 0)
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // Calculate grid lines
  const gridLineCount = 5;
  const gridValues = Array.from({ length: gridLineCount }, (_, i) => {
    const value = minValue + (valueRange / (gridLineCount - 1)) * i;
    return Math.round(value);
  });

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / (data.length - 1 || 1)) * innerWidth;
  };

  const yScale = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // Generate path for each line
  const generatePath = (line: LineConfig) => {
    const points = data.map((d, i) => {
      const x = xScale(i);
      const y = yScale(Number(d[line.dataKey]) || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return points;
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
          const x = xScale(i);
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

        {/* Lines */}
        {lines.map((line, lineIndex) => (
          <g key={lineIndex}>
            <path
              d={generatePath(line)}
              fill="none"
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {data.map((d, i) => {
              const x = xScale(i);
              const y = yScale(Number(d[line.dataKey]) || 0);
              const isHovered = hoveredPoint?.index === i && hoveredPoint?.line === line.dataKey;
              
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={line.stroke}
                  stroke="white"
                  strokeWidth={2}
                  style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                  onMouseEnter={() => setHoveredPoint({ index: i, line: line.dataKey })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none"
          style={{
            left: `${(hoveredPoint.index / (data.length - 1)) * 100}%`,
            top: '10px',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <div className="font-medium mb-1">
            {String(data[hoveredPoint.index][xAxisKey])}
          </div>
          {lines.map((line) => {
            const value = data[hoveredPoint.index][line.dataKey];
            return (
              <div key={line.dataKey} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: line.stroke }}
                />
                <span className="text-gray-600">{line.name}:</span>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {lines.map((line) => (
          <div key={line.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: line.stroke }}
            />
            <span className="text-gray-600">{line.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
