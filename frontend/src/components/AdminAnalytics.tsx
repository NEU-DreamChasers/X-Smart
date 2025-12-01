'use client';

import { useEffect, useState } from 'react';
import { Database, Wifi, Activity, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api.service';

const DEFAULT_CHART_LOC = '1566083'; // ID mặc định (Hà Nội)
const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

// Hàm delay giúp tránh spam server
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeSensors: 0,
    totalReports: 0,
    pendingReports: 0,
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
        console.log("--- 1. Bắt đầu tải dữ liệu Thống kê ---");

        // GIAI ĐOẠN 1: Tải các chỉ số cơ bản (Nhẹ)
        // Dùng Promise.allSettled để nếu 1 cái lỗi cũng không làm sập toàn bộ
        const results = await Promise.allSettled([
           api.get('/weather/status'),
           api.get('/air/status'),
           api.get('/bus/status'),
           api.get('/parking/status'),
           api.get('/sources'),
           api.get('/reports/admin/stats')
        ]);

        // Helper để lấy data an toàn từ Promise.allSettled
        const getData = (result: PromiseSettledResult<any>) => 
            result.status === 'fulfilled' ? result.value.data : [];

        const weatherData = getData(results[0]);
        const airData = getData(results[1]);
        const busData = getData(results[2]);
        const parkingData = getData(results[3]);
        const sourcesData = getData(results[4]);
        const reportStats = getData(results[5]) || { total: 0, pending: 0 };

        // Tính tổng
        const totalEnt = (Array.isArray(weatherData) ? weatherData.length : 0) + 
                         (Array.isArray(airData) ? airData.length : 0) +
                         (Array.isArray(busData) ? busData.length : 0) +
                         (Array.isArray(parkingData) ? parkingData.length : 0);

        setStats({
            totalEntities: totalEnt,
            activeSensors: Array.isArray(sourcesData) ? sourcesData.length : 0,
            totalReports: reportStats.total || 0,
            pendingReports: reportStats.pending || 0,
            apiHealth: 'Stable'
        });

        // --- QUAN TRỌNG: Delay 1 giây để tránh lỗi 429 ---
        console.log("--- Nghỉ 1s trước khi tải biểu đồ ---");
        await delay(1000); 

        // GIAI ĐOẠN 2: Tải dữ liệu biểu đồ (Nặng hơn)
        console.log("--- 2. Bắt đầu tải dữ liệu Biểu đồ ---");
        
        // Gọi từng API một thay vì Promise.all để giảm tải server tối đa
        // (Nếu server khỏe có thể dùng Promise.all, nhưng an toàn thì gọi tuần tự)
        
        try {
            const resChartTemp = await api.get(`/history/chart/temperature/${DEFAULT_CHART_LOC}?hours=24`);
            setTempData(transformChartData(resChartTemp.data));
        } catch (e) { console.warn("Lỗi tải chart Temp", e); }

        try {
            const resChartPrecip = await api.get(`/history/chart/precipitation/${DEFAULT_CHART_LOC}?hours=24`);
            setPrecipData(transformChartData(resChartPrecip.data));
        } catch (e) { console.warn("Lỗi tải chart Mưa", e); }

        try {
            const resChartAqi = await api.get(`/history/chart/aqi/${DEFAULT_CHART_LOC}?hours=24`);
            setAqiData(transformChartData(resChartAqi.data));
        } catch (e) { console.warn("Lỗi tải chart AQI", e); }

      } catch (error) {
        console.error("Lỗi chung Dashboard:", error);
        setStats(prev => ({ ...prev, apiHealth: 'Degraded' }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm helper chuyển đổi dữ liệu Chart (tách ra ngoài cho gọn)
  const transformChartData = (apiData: any) => {
    if (!apiData?.labels || !apiData?.datasets?.[0]) return [];
    return apiData.labels.map((l: string, i: number) => ({
        time: l.includes(' ') ? l.split(' ')[1] : l,
        value: apiData.datasets[0].data[i]
    }));
  };

  return (
    <div className="space-y-6">
      {/* ... Phần giao diện giữ nguyên không thay đổi ... */}
      
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-blue-50 border border-blue-100">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">IOT</span>
            </div>
            <p className="text-sm text-gray-500">Tổng Entity IoT</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">
                {loading ? '...' : stats.totalEntities.toLocaleString()}
            </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-green-50 border border-green-100">
                  <Wifi className="w-5 h-5 text-green-600" />
                </div>
            </div>
            <p className="text-sm text-gray-500">Nguồn dữ liệu</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">
                {loading ? '...' : stats.activeSensors}
            </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-orange-50 border border-orange-100">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                {stats.pendingReports > 0 && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                        {stats.pendingReports} chờ xử lý
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500">Phản ánh người dân</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">
                {loading ? '...' : stats.totalReports}
            </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm hover:shadow-md transition-shadow" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-purple-50 border border-purple-100">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div className={`w-2 h-2 rounded-full ${stats.apiHealth === 'Stable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-sm text-gray-500">Hệ thống</p>
            <p className="text-xl font-bold text-neutral-950 mt-1 truncate">
                {stats.apiHealth}
            </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhiệt độ */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-medium text-neutral-950">Biểu đồ Nhiệt độ</h3>
                <p className="text-sm text-gray-500">Quan trắc 24 giờ qua</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                    <YAxis unit="°C" stroke="#888" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={false} name="Nhiệt độ"/>
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
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Bar dataKey="value" fill="#3b82f6" name="Lượng mưa" radius={[4,4,0,0]} barSize={20} />
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
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="PM2.5"/>
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
}