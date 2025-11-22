'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart';
import { SimplePieChart } from './SimplePieChart';

const entityGrowth = [ { month: 'T6', total: 10200, new: 850 }, { month: 'T7', total: 10850, new: 650 }, { month: 'T8', total: 11234, new: 384 }, { month: 'T9', total: 11678, new: 444 }, { month: 'T10', total: 12089, new: 411 }, { month: 'T11', total: 12456, new: 367 } ];
const dataQuality = [ { name: 'Hoàn chỉnh', value: 92, color: '#10b981' }, { name: 'Chính xác', value: 88, color: '#3b82f6' }, { name: 'Kịp thời', value: 95, color: '#f59e0b' }, { name: 'Nhất quán', value: 90, color: '#8b5cf6' } ];
const apiUsage = [ { endpoint: '/entities', calls: 156789, avgTime: '45ms' }, { endpoint: '/subs', calls: 23456, avgTime: '32ms' } ];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng API Calls', value: '238K', change: '+12%', trend: 'up' },
          { label: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
          { label: 'Avg Response', value: '67ms', change: '-15%', trend: 'down' },
          { label: 'Active Users', value: '8,234', change: '+456', trend: 'up' },
        ].map((metric, index) => {
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <div key={index} className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <div className={`flex items-center gap-1 ${trendColor} bg-gray-50 px-2 py-0.5 rounded-md border border-black/5`}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">{metric.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-950">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Growth */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Tăng trưởng Entity</h3>
            <p className="text-sm text-gray-500">6 tháng gần nhất</p>
          </div>
          <SimpleLineChart 
            data={entityGrowth}
            xAxisKey="month"
            lines={[{ dataKey: 'total', stroke: '#3b82f6', name: 'Tổng' }, { dataKey: 'new', stroke: '#10b981', name: 'Mới' }]}
            height={250}
          />
        </div>

        {/* Data Quality */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Chất lượng dữ liệu</h3>
            <p className="text-sm text-gray-500">Đánh giá theo 4 tiêu chí</p>
          </div>
          <SimplePieChart data={dataQuality} />
        </div>
      </div>

      {/* API Usage */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-950">Sử dụng API</h3>
          <p className="text-sm text-gray-500">NGSI-LD endpoints</p>
        </div>
        <div className="space-y-3">
          {apiUsage.map((api, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-[14px]" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-mono text-neutral-900">{api.endpoint}</p>
                <Badge variant="outline" className="bg-white text-neutral-950 shadow-none" style={cardStyle}>{api.avgTime}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{api.calls.toLocaleString()} calls</span>
                <span>Avg response time</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}