'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Wifi, AlertCircle, Users, Activity } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart';

const systemStats = [
  { title: 'Tổng Entity', value: '12,456', change: '+234', icon: Database, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { title: 'Sensors hoạt động', value: '1,245', change: '+12', icon: Wifi, color: 'text-green-600', bgColor: 'bg-green-50' },
  { title: 'Cảnh báo', value: '8', change: '-3', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { title: 'Người dùng hoạt động', value: '8,234', change: '+456', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const dataIngestionRate = [
  { time: '00:00', entities: 120, observations: 450 },
  { time: '04:00', entities: 95, observations: 380 },
  { time: '08:00', entities: 280, observations: 920 },
  { time: '12:00', entities: 350, observations: 1100 },
  { time: '16:00', entities: 420, observations: 1350 },
  { time: '20:00', entities: 310, observations: 980 },
];

const entityTypeDistribution = [
  { type: 'AirQuality', count: 245 },
  { type: 'BusStop', count: 389 },
  { type: 'Parking', count: 567 },
  { type: 'Light', count: 1234 },
  { type: 'Water', count: 156 },
  { type: 'Other', count: 423 },
];

const recentActivities = [
  { type: 'sensor', message: 'Cảm biến mới được thêm: AirQualityObserved:Q7', time: '5 phút trước', severity: 'info' },
  { type: 'alert', message: 'Phát hiện giá trị bất thường từ sensor WaterSupply:W12', time: '12 phút trước', severity: 'warning' },
  { type: 'system', message: 'Đồng bộ dữ liệu thành công với OpenWeatherMap API', time: '28 phút trước', severity: 'success' },
  { type: 'user', message: '234 người dùng mới đăng ký trong ngày', time: '1 giờ trước', severity: 'info' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-[10px] ${stat.bgColor}`} style={{ border: '0.8px solid rgba(0,0,0,0.05)' }}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="bg-white text-neutral-950" style={cardStyle}>{stat.change}</Badge>
              </div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-neutral-950 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Ingestion Rate */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Tốc độ thu thập dữ liệu</h3>
            <p className="text-sm text-gray-500">Entity updates và observations theo giờ</p>
          </div>
          <SimpleLineChart 
            data={dataIngestionRate}
            xAxisKey="time"
            lines={[
              { dataKey: 'entities', stroke: '#3b82f6', name: 'Entities', strokeWidth: 2 },
              { dataKey: 'observations', stroke: '#10b981', name: 'Observations', strokeWidth: 2 },
            ]}
            height={250}
          />
        </div>

        {/* Entity Type Distribution */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Phân bố Entity theo loại</h3>
            <p className="text-sm text-gray-500">NGSI-LD Entity Types</p>
          </div>
          <SimpleBarChart 
            data={entityTypeDistribution}
            xAxisKey="type"
            bars={[{ dataKey: 'count', fill: '#3b82f6', name: 'Số lượng' }]}
            height={250}
          />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-950">Trạng thái hệ thống</h3>
          <p className="text-sm text-gray-500">Các dịch vụ và API</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'NGSI-LD Context Broker', status: 'Hoạt động', uptime: '99.9%' },
            { name: 'OpenWeatherMap API', status: 'Hoạt động', uptime: '99.5%' },
            { name: 'OpenStreetMap Overpass', status: 'Hoạt động', uptime: '99.7%' },
            { name: 'OpenAQ Integration', status: 'Hoạt động', uptime: '98.2%' },
            { name: 'FIWARE Data Models', status: 'Hoạt động', uptime: '100%' },
            { name: 'SOSA/SSN Processor', status: 'Hoạt động', uptime: '99.8%' },
          ].map((service, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-[14px]" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-950">{service.name}</p>
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-white text-neutral-950" style={cardStyle}>{service.status}</Badge>
                <span className="text-xs text-gray-500">Uptime: {service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-950">Hoạt động gần đây</h3>
          <p className="text-sm text-gray-500">Nhật ký hệ thống</p>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-[14px]" style={cardStyle}>
              <div className={`w-2 h-2 rounded-full mt-2 ${activity.severity === 'warning' ? 'bg-yellow-500' : activity.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900 font-medium">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}