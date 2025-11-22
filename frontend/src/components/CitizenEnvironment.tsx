'use client';

import React from 'react';
import { Wind, Thermometer, Droplets, Sun, TrendingDown, TrendingUp } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';

const currentConditions = [
  { name: 'Chất lượng không khí', value: '45 AQI', status: 'Tốt', icon: Wind, color: '#00a63e', bgColor: '#d4f7e1', trend: 'down', change: '-5%' },
  { name: 'Nhiệt độ', value: '28°C', status: 'Bình thường', icon: Thermometer, color: '#f54900', bgColor: '#ffedd4', trend: 'up', change: '+2°C' },
  { name: 'Độ ẩm', value: '68%', status: 'Cao', icon: Droplets, color: '#0092b8', bgColor: '#cefafe', trend: 'up', change: '+5%' },
  { name: 'Chỉ số UV', value: '8', status: 'Cao', icon: Sun, color: '#d08700', bgColor: '#fef9c2', trend: 'neutral', change: '0' },
];

const airQualityData = [
  { time: '08:00', pm25: 45, pm10: 55 },
  { time: '10:00', pm25: 52, pm10: 62 },
  { time: '12:00', pm25: 48, pm10: 58 },
  { time: '14:00', pm25: 43, pm10: 53 },
  { time: '16:00', pm25: 39, pm10: 49 },
  { time: '18:00', pm25: 42, pm10: 52 },
];

const chartLinesConfig = [
  { dataKey: 'pm25', stroke: '#3b82f6', name: 'PM 2.5' },
  { dataKey: 'pm10', stroke: '#10b981', name: 'PM 10' },
];

// Style chung cho border để đảm bảo độ mỏng 0.8px
const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenEnvironment() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentConditions.map((condition) => {
          const Icon = condition.icon;
          const TrendIcon = condition.trend === 'up' ? TrendingUp : condition.trend === 'down' ? TrendingDown : null;
          
          return (
            <div 
              key={condition.name} 
              className="bg-white rounded-[14px] p-6 hover:shadow-sm transition-shadow"
              style={cardStyle} // Sử dụng style trực tiếp
            >
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-[10px] p-2 size-9" style={{ backgroundColor: condition.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: condition.color }} />
                </div>
                {TrendIcon && (
                  <div className="flex items-center gap-1 text-xs text-[#4a5565]">
                    <TrendIcon className="w-3 h-3" />
                    <span>{condition.change}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-[#4a5565] mb-1">{condition.name}</p>
              <p className="text-base mb-2 font-medium" style={{ color: condition.color }}>{condition.value}</p>
              <div className="inline-block px-2 py-[2px] rounded-lg text-xs text-neutral-950" style={cardStyle}>
                {condition.status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[14px] p-6" style={cardStyle}>
        <div className="mb-6">
          <h3 className="text-base font-medium text-neutral-950 mb-1">Xu hướng chất lượng không khí</h3>
          <p className="text-sm text-[#4a5565]">Dữ liệu hôm nay</p>
        </div>
        <div className="w-full">
          <SimpleLineChart data={airQualityData} xAxisKey="time" lines={chartLinesConfig} height={250} />
        </div>
      </div>
    </div>
  );
}