'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Database, Wifi, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DEFAULT_CHART_LOC = '1566083'; 

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeSensors: 0,
    apiHealth: 'Checking...'
  });

  const [tempData, setTempData] = useState([]);
  const [precipData, setPrecipData] = useState([]);
  const [aqiData, setAqiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("--- Bắt đầu tải dữ liệu Admin Analytics ---");

        // 1. GỌI API THỐNG KÊ
        const [resWeather, resAir, resBus, resParking, resSources] = await Promise.all([
           fetch(`${API_URL}/weather/status`),
           fetch(`${API_URL}/air/status`),
           fetch(`${API_URL}/bus/status`),
           fetch(`${API_URL}/parking/status`),
           fetch(`${API_URL}/sources`)
        ]);

        const dWeather = await resWeather.json();
        const dAir = await resAir.json();
        const dBus = await resBus.json();
        const dParking = await resParking.json();
        const dSources = await resSources.json();

        // [DEBUG] In ra console để kiểm tra độ dài mảng
        console.log("Weather Count:", Array.isArray(dWeather) ? dWeather.length : 'Not Array', dWeather);
        console.log("Air Count:", Array.isArray(dAir) ? dAir.length : 'Not Array');
        console.log("Bus Count:", Array.isArray(dBus) ? dBus.length : 'Not Array');
        console.log("Parking Count:", Array.isArray(dParking) ? dParking.length : 'Not Array');
        console.log("Sources Count:", Array.isArray(dSources) ? dSources.length : 'Not Array');

        const totalEnt = (Array.isArray(dWeather) ? dWeather.length : 0) + 
                         (Array.isArray(dAir) ? dAir.length : 0) +
                         (Array.isArray(dBus) ? dBus.length : 0) +
                         (Array.isArray(dParking) ? dParking.length : 0);

        setStats({
            totalEntities: totalEnt,
            activeSensors: Array.isArray(dSources) ? dSources.length : 0,
            apiHealth: 'On'
        });

        // 2. GỌI API BIỂU ĐỒ
        const [resChartTemp, resChartPrecip, resChartAqi] = await Promise.all([
            fetch(`${API_URL}/history/chart/temperature/${DEFAULT_CHART_LOC}?hours=24`),
            fetch(`${API_URL}/history/chart/precipitation/${DEFAULT_CHART_LOC}?hours=24`),
            fetch(`${API_URL}/history/chart/aqi/${DEFAULT_CHART_LOC}?hours=24`)
        ]);

        const cTemp = await resChartTemp.json();
        const cPrecip = await resChartPrecip.json();
        const cAqi = await resChartAqi.json();

        console.log("Chart Temp Data:", cTemp);

        const transform = (apiData: any) => {
            if (!apiData?.labels || !apiData?.datasets?.[0]) return [];
            return apiData.labels.map((l: string, i: number) => ({
                time: l.includes(' ') ? l.split(' ')[1] : l,
                value: apiData.datasets[0].data[i]
            }));
        };

        setTempData(transform(cTemp));
        setPrecipData(transform(cPrecip));
        setAqiData(transform(cAqi));

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setStats(prev => ({ ...prev, apiHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tổng Entity */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-[10px] bg-blue-50 border border-blue-100">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-gray-50 px-2 py-0.5 rounded-md border border-black/5">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Live</span>
                </div>
            </div>
            <p className="text-sm text-gray-600">Tổng Entity quản lý</p>
            <p className="text-2xl font-bold text-neutral-950">
                {loading ? '...' : stats.totalEntities.toLocaleString()}
            </p>
        </div>

        {/* Card 2: Sensors */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-[10px] bg-green-50 border border-green-100">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
            </div>
            <p className="text-sm text-gray-600">Nguồn dữ liệu (Sensors)</p>
            <p className="text-2xl font-bold text-neutral-950">
                {loading ? '...' : stats.activeSensors}
            </p>
        </div>

        {/* Card 3: Health */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-[10px] bg-purple-50 border border-purple-100">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
            </div>
            <p className="text-sm text-gray-600">Trạng thái API</p>
            <p className="text-2xl font-bold text-neutral-950">
                {stats.apiHealth}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhiệt độ */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Biểu đồ Nhiệt độ</h3>
            <p className="text-sm text-gray-500">Dữ liệu 24 giờ qua</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                    <YAxis unit="°C" stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} name="Nhiệt độ"/>
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lượng mưa */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Lượng mưa</h3>
            <p className="text-sm text-gray-500">Dữ liệu 24 giờ qua</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={precipData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                    <YAxis unit="mm" stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Lượng mưa" radius={[4,4,0,0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* AQI */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-950">Chất lượng không khí (PM2.5)</h3>
            <p className="text-sm text-gray-500">Dữ liệu 24 giờ qua</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aqiData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                    <YAxis unit="µg/m³" stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} name="PM2.5"/>
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
}