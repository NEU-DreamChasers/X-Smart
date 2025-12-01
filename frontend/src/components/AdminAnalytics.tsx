'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEFAULT_LOC = '1566083'; // ID TP.HCM

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminAnalytics() {
  const [tempData, setTempData] = useState([]);
  const [precipData, setPrecipData] = useState([]);
  const [aqiData, setAqiData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Lấy dữ liệu API
            const [resTemp, resPrecip, resAqi] = await Promise.all([
                 fetch(`${API_URL}/history/chart/temperature/${DEFAULT_LOC}?hours=24`),
                 fetch(`${API_URL}/history/chart/precipitation/${DEFAULT_LOC}?hours=24`),
                 fetch(`${API_URL}/history/chart/aqi/${DEFAULT_LOC}?hours=24`)
            ]);

            const dTemp = await resTemp.json();
            const dPrecip = await resPrecip.json();
            const dAqi = await resAqi.json();

            // Transform dữ liệu
            if(dTemp.labels) setTempData(dTemp.labels.map((l:any, i:number) => ({ time: l.split(' ')[1], value: dTemp.datasets[0].data[i]})));
            if(dPrecip.labels) setPrecipData(dPrecip.labels.map((l:any, i:number) => ({ time: l.split(' ')[1], value: dPrecip.datasets[0].data[i]})));
            if(dAqi.labels) setAqiData(dAqi.labels.map((l:any, i:number) => ({ time: l.split(' ')[1], value: dAqi.datasets[0].data[i]})));

        } catch (e) { console.error("Analytics fetch error", e); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics (Giữ nguyên hoặc thay bằng API thật nếu cần) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng API Calls', value: 'Live', change: '...', trend: 'up' },
          { label: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
        ].map((metric, index) => (
            <div key={index} className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
               <p className="text-sm text-gray-600">{metric.label}</p>
               <p className="text-2xl font-bold text-neutral-950">{metric.value}</p>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ Nhiệt độ */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Nhiệt độ (24h)</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Lượng mưa */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Lượng mưa (24h)</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precipData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Biểu đồ Không khí */}
       <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-neutral-950">Chất lượng không khí (PM2.5)</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aqiData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
}