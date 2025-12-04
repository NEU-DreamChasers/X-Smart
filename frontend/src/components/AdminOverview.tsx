/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Wifi, AlertCircle, Users, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  
  // State cho số liệu tổng quan
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeSensors: 0,
    alerts: 0,
    users: 1250, // Giả định số user (vì chưa có API đếm user)
  });

  // State cho biểu đồ phân bố
  const [distributionData, setDistributionData] = useState<any[]>([]);
  
  // State cho trạng thái hệ thống
  const [systemHealth, setSystemHealth] = useState([
    { name: 'Core API Service', status: 'Checking...', uptime: '--' },
    { name: 'Database Connection', status: 'Checking...', uptime: '--' },
    { name: 'Context Broker', status: 'Checking...', uptime: '--' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Gọi song song các API để lấy dữ liệu
        // Lưu ý: Ta dùng Promise.allSettled để nếu 1 API lỗi thì các API khác vẫn hiển thị được
        const results = await Promise.allSettled([
           fetch(`${API_URL}/weather/status`),
           fetch(`${API_URL}/air/status`),
           fetch(`${API_URL}/bus/status`),
           fetch(`${API_URL}/parking/status`),
           fetch(`${API_URL}/sources`),
           // fetch(`${API_URL}/reports`) // Nếu có API reports
        ]);

        // Helper để lấy data từ kết quả Promise
        const getData = async (result: PromiseSettledResult<Response>) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                return await result.value.json();
            }
            return [];
        };

        const dWeather = await getData(results[0]);
        const dAir = await getData(results[1]);
        const dBus = await getData(results[2]);
        const dParking = await getData(results[3]);
        const dSources = await getData(results[4]);

        // 2. Tính toán số liệu
        const countWeather = Array.isArray(dWeather) ? dWeather.length : 0;
        const countAir = Array.isArray(dAir) ? dAir.length : 0;
        const countBus = Array.isArray(dBus) ? dBus.length : 0;
        const countParking = Array.isArray(dParking) ? dParking.length : 0;
        const countSensors = Array.isArray(dSources) ? dSources.length : 0;

        const total = countWeather + countAir + countBus + countParking;

        setStats(prev => ({
            ...prev,
            totalEntities: total,
            activeSensors: countSensors,
            alerts: 5, // Hardcode demo hoặc lấy từ logic cảnh báo
        }));

        // 3. Cập nhật biểu đồ phân bố
        setDistributionData([
            { type: 'Thời tiết', count: countWeather, fill: '#ef4444' },
            { type: 'Không khí', count: countAir, fill: '#10b981' },
            { type: 'Xe buýt', count: countBus, fill: '#3b82f6' },
            { type: 'Bãi đỗ', count: countParking, fill: '#f59e0b' },
        ]);

        // 4. Cập nhật trạng thái hệ thống (Nếu fetch thành công -> Hoạt động)
        setSystemHealth([
            { name: 'Core API Service', status: 'Hoạt động', uptime: '99.9%' },
            { name: 'Database Connection', status: 'Hoạt động', uptime: '100%' },
            { name: 'Context Broker', status: results[0].status === 'fulfilled' ? 'Hoạt động' : 'Gián đoạn', uptime: '98.5%' },
        ]);

      } catch (error) {
        console.error("Dashboard Overview Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Demo dữ liệu biểu đồ đường (Giữ nguyên hoặc thay bằng API History nếu muốn chi tiết)
  const ingestionRate = [
    { time: '08:00', value: 120 }, { time: '10:00', value: 350 },
    { time: '12:00', value: 420 }, { time: '14:00', value: 280 },
    { time: '16:00', value: 500 }, { time: '18:00', value: 650 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Tổng Entity', value: stats.totalEntities, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Sensors nguồn', value: stats.activeSensors, icon: Wifi, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Cảnh báo', value: stats.alerts, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Người dùng', value: stats.users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-[10px] ${item.bg}`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
                <p className="text-sm text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-neutral-950 mt-1">
                    {loading ? '...' : item.value.toLocaleString()}
                </p>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ tốc độ xử lý (Demo) */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Tải hệ thống</h3>
            <p className="text-sm text-gray-500">Số lượng request xử lý theo giờ</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ingestionRate}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ phân bố Entity (Real Data) */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Phân bố dữ liệu</h3>
            <p className="text-sm text-gray-500">Số lượng Entity theo từng loại</p>
          </div>
          <div className="h-[250px]">
            {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Đang tải biểu đồ...</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="type" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fill: '#666' }} />
                    </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-950">Trạng thái dịch vụ</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemHealth.map((service, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-[14px]" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-950">{service.name}</p>
                <Activity className={`w-4 h-4 ${service.status === 'Hoạt động' ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={service.status === 'Hoạt động' ? 'outline' : 'secondary'} className="bg-white text-neutral-950">
                    {service.status}
                </Badge>
                <span className="text-xs text-gray-500">Uptime: {service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}