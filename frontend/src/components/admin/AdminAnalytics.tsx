/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/

'use client';

import { useEffect, useState } from 'react';
import { Database, Wifi, Activity, FileText, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api.service';

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeSensors: 0,
    totalReports: 0,
    pendingReports: 0,
    apiHealth: 'Checking...'
  });

  const [tempData, setTempData] = useState<any[]>([]);
  const [precipData, setPrecipData] = useState<any[]>([]);
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStation, setCurrentStation] = useState({ name: 'Đang tìm...', id: '' });

  const transformChartData = (apiData: any) => {
    if (!apiData || !apiData.labels || !apiData.datasets?.[0]) return [];
    return apiData.labels.map((label: string, index: number) => ({
        time: label.includes(' ') ? label.split(' ')[1] : label, 
        value: apiData.datasets[0].data[index]
    }));
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        const [
            resWeather, 
            resAir, 
            resBus, 
            resParking, 
            resSources, 
            resReports
        ] = await Promise.all([
           api.get('/weather/status').catch(() => ({ data: [] })),
           api.get('/air/status').catch(() => ({ data: [] })),
           api.get('/bus/status').catch(() => ({ data: [] })),
           api.get('/parking/status').catch(() => ({ data: [] })),
           api.get('/sources').catch(() => ({ data: [] })),
           api.get('/reports/admin/stats').catch(() => ({ data: { totalReports: 0 } }))
        ]);

        const getCount = (res: any) => Array.isArray(res.data) ? res.data.length : 0;

        const countWeather = getCount(resWeather);
        const countAir = getCount(resAir);
        const countBus = getCount(resBus);
        const countParking = getCount(resParking);
        const totalEnt = countWeather + countAir + countBus + countParking;
        const reportStatsData = resReports.data;
        const pendingItem = Array.isArray(reportStatsData.byStatus) 
            ? reportStatsData.byStatus.find((item: any) => item.status === 'PENDING') 
            : null;

        setStats({
            totalEntities: totalEnt, 
            activeSensors: getCount(resSources),
            totalReports: reportStatsData.totalReports || 0,
            pendingReports: pendingItem ? Number(pendingItem.count) : 0,
            apiHealth: 'Stable'
        });

        let targetLocation = '1566083'; 
        let stationName = 'Mặc định';
        const weatherList = Array.isArray(resWeather.data) ? resWeather.data : [];

        if (weatherList.length > 0) {
            const firstStation = weatherList[0];
            if (firstStation.id && typeof firstStation.id === 'string') {
                targetLocation = firstStation.id.split(':').pop(); 
                stationName = firstStation.address?.addressLocality || firstStation.id;
            }
        }

        setCurrentStation({ name: stationName, id: targetLocation });
        await delay(500);

        try {
            const res = await api.get(`/history/chart/temperature/${targetLocation}?hours=24`);
            setTempData(transformChartData(res.data));
        } catch (e) { setTempData([]); }

        try {
            const res = await api.get(`/history/chart/precipitation/${targetLocation}?hours=24`);
            setPrecipData(transformChartData(res.data));
        } catch (e) { setPrecipData([]); }

        let targetAirLocation = targetLocation;
        const airList = Array.isArray(resAir.data) ? resAir.data : [];
        if (airList.length > 0) {
             targetAirLocation = airList[0].id.split(':').pop();
        }

        try {
            const res = await api.get(`/history/chart/aqi/${targetAirLocation}?hours=24`);
            setAqiData(transformChartData(res.data));
        } catch (e) { setAqiData([]); }

      } catch (error) {
        console.error("Lỗi khởi tạo Dashboard:", error);
        setStats(prev => ({ ...prev, apiHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  const EmptyChart = ({ text }: { text: string }) => (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-[10px] border border-dashed border-gray-200">
        <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
        <span className="text-xs font-medium">{text}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TỔNG ENTITY IOT */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-blue-50 border border-blue-100"><Database className="w-5 h-5 text-blue-600" /></div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">IOT</span>
            </div>
            <p className="text-sm text-gray-500">Tổng Entity IoT</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.totalEntities}</p>
        </div>

        {/* CARD 2: NGUỒN DỮ LIỆU */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-green-50 border border-green-100"><Wifi className="w-5 h-5 text-green-600" /></div>
            </div>
            <p className="text-sm text-gray-500">Nguồn dữ liệu</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.activeSensors}</p>
        </div>

        {/* CARD 3: PHẢN ÁNH */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-orange-50 border border-orange-100"><FileText className="w-5 h-5 text-orange-600" /></div>
                {stats.pendingReports > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{stats.pendingReports} chờ duyệt</span>}
            </div>
            <p className="text-sm text-gray-500">Phản ánh người dân</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.totalReports}</p>
        </div>

        {/* CARD 4: TRẠNG THÁI HỆ THỐNG */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-purple-50 border border-purple-100"><Activity className="w-5 h-5 text-purple-600" /></div>
                <div className={`w-2 h-2 rounded-full ${stats.apiHealth === 'Stable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-sm text-gray-500">Hệ thống</p>
            <p className="text-xl font-bold text-neutral-950 mt-1 truncate">{stats.apiHealth}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
         <MapPin className="w-3 h-3" />
         <span>Đang hiển thị dữ liệu từ: <b>{currentStation.name}</b> (ID: {currentStation.id})</span>
      </div>

      {/* Biểu đồ (Giữ nguyên) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Biểu đồ Nhiệt độ</h3><p className="text-sm text-gray-500">Quan trắc 24 giờ qua</p></div>
          <div className="h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             tempData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                        <YAxis unit="°C" stroke="#888" domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={false} name="Nhiệt độ"/>
                    </LineChart>
                </ResponsiveContainer>
            ) : <EmptyChart text="Chưa có dữ liệu nhiệt độ" />}
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Lượng mưa</h3><p className="text-sm text-gray-500">Dữ liệu 24 giờ qua</p></div>
          <div className="h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             precipData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={precipData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                        <YAxis unit="mm" stroke="#888" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" name="Lượng mưa" radius={[4,4,0,0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <EmptyChart text="Không có mưa trong 24h qua" />}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Chất lượng không khí (AQI)</h3><p className="text-sm text-gray-500">Dữ liệu 24 giờ qua</p></div>
          <div className="h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             aqiData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aqiData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                        <YAxis unit="" stroke="#888" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="AQI"/>
                    </LineChart>
                </ResponsiveContainer>
            ) : <EmptyChart text="Chưa có dữ liệu AQI" />}
          </div>
        </div>
    </div>
  );
}