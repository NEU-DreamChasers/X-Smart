/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/

'use client';

import { useEffect, useState } from 'react';
import { Database, Wifi, Activity, FileText, Loader2, AlertCircle, MapPin, ChevronDown, Info, CalendarDays } from 'lucide-react';
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

  const [weatherList, setWeatherList] = useState<any[]>([]);
  const [airList, setAirList] = useState<any[]>([]);

  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [currentStationName, setCurrentStationName] = useState<string>('Đang tải...');
  const [linkedAirStationName, setLinkedAirStationName] = useState<string>('');

  const [timeRange, setTimeRange] = useState<number>(24);

  const [linkedAirInfo, setLinkedAirInfo] = useState<{ id: string, name: string, status: 'exact' | 'approx' | 'none' }>({
      id: '', name: '', status: 'none'
  });

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false); 

  const getTimeLabel = () => {
      if (timeRange <= 24) return '24 giờ qua';
      if (timeRange <= 168) return '7 ngày qua';
      return '30 ngày qua';
  };

  const transformChartData = (apiData: any) => {
    if (!apiData || !apiData.labels || !apiData.datasets?.[0]) return [];
    return apiData.labels.map((label: string, index: number) => {
        let timeLabel = label;
        const dateObj = new Date(label);

        if (!isNaN(dateObj.getTime())) {
            if (timeRange <= 24) {
                const h = dateObj.getHours().toString().padStart(2, '0');
                const m = dateObj.getMinutes().toString().padStart(2, '0');
                timeLabel = `${h}:${m}`;
            } else {
                const d = dateObj.getDate().toString().padStart(2, '0');
                const mon = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const h = dateObj.getHours().toString().padStart(2, '0');
                
                timeLabel = timeRange <= 168 ? `${d}/${mon} ${h}h` : `${d}/${mon}`;
            }
        } else if (label.includes(' ')) {
             timeLabel = label.split(' ')[1]?.slice(0, 5) || label;
        }

        const rawVal = apiData.datasets[0].data[index];
        const value = typeof rawVal === 'number' ? Number(rawVal.toFixed(2)) : rawVal;
        
        return { time: timeLabel, value };
    });
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

        const wList = Array.isArray(resWeather.data) ? resWeather.data : [];
        const aList = Array.isArray(resAir.data) ? resAir.data : [];
        setWeatherList(wList);
        setAirList(aList);

        if (wList.length > 0) {
            setSelectedStationId(wList[0].id);
        }

      } catch (error) {
        console.error("Lỗi khởi tạo Dashboard:", error);
        setStats(prev => ({ ...prev, apiHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  // Xử lý khi chọn trạm/thời gian để vẽ biểu đồ
  useEffect(() => {
    const fetchCharts = async () => {
        if (!selectedStationId || weatherList.length === 0) return;

        setChartLoading(true);
        try {
            const currentStation = weatherList.find(w => w.id === selectedStationId);
            if (!currentStation) return;

            const sName = currentStation.address?.addressLocality || currentStation.name?.value || '';
            setCurrentStationName(sName || currentStation.id);

            let targetAirId = '';
            let airName = '';
            let matchStatus: 'exact' | 'approx' | 'none' = 'none';
            
            const wLoc = currentStation.location?.value?.coordinates || currentStation.location;
            
            if (wLoc && Array.isArray(wLoc)) {
                const exactMatch = airList.find(a => {
                    const aLoc = a.location?.value?.coordinates || a.location;
                    return aLoc && Math.abs(aLoc[0] - wLoc[0]) < 0.001 && Math.abs(aLoc[1] - wLoc[1]) < 0.002;
                });
                if (exactMatch) {
                    targetAirId = exactMatch.id;
                    airName = exactMatch.name?.value || exactMatch.id;
                    matchStatus = 'exact';
                } 
                else if (sName) {
                    const cleanName = sName.replace('Weather', '').replace('Trạm', '').replace('Thời tiết', '').trim();
                    if (cleanName.length > 3) { // Chỉ tìm nếu tên đủ dài
                        const nameMatch = airList.find(a => {
                            const aName = a.name?.value || a.name || '';
                            return aName.includes(cleanName);
                        });
                        if (nameMatch) {
                            targetAirId = nameMatch.id;
                            airName = nameMatch.name?.value || nameMatch.id;
                            matchStatus = 'approx';
                        }
                    }
                }
             } 

            setLinkedAirInfo({ 
                id: targetAirId, 
                name: airName, 
                status: matchStatus 
            });
            
            // Gọi API biểu đồ
            const promises = [
                api.get(`/history/chart`, { params: { entityId: selectedStationId, attr: 'temperature', hours: 24 } }).catch(() => ({ data: {} })),
                api.get(`/history/chart`, { params: { entityId: selectedStationId, attr: 'precipitation', hours: 24 } }).catch(() => ({ data: {} })),
            ];
            if (targetAirId) {
                promises.push(api.get(`/history/chart`, { params: { entityId: targetAirId, attr: 'pm25', hours: 24 } }).catch(() => ({ data: {} })));
            } else {
                promises.push(Promise.resolve({ data: {} }));
            }
            const [resTemp, resRain, resAqi] = await Promise.all(promises);

            setTempData(transformChartData(resTemp.data));
            setPrecipData(transformChartData(resRain.data));
            setAqiData(transformChartData(resAqi.data));

        }
         catch (e) {
            console.error("Lỗi tải biểu đồ:", e);
        } finally {
            setChartLoading(false);
        }
    };

    fetchCharts();
  }, [selectedStationId, weatherList, airList, timeRange]);  

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

      {/* THANH CÔNG CỤ */}
      <div className="bg-white p-5 rounded-[14px] shadow-sm space-y-5" style={cardStyle}>
         
         {/* CHỌN TRẠM QUAN TRẮC */}
         <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-full shrink-0"><MapPin className="w-5 h-5 text-blue-600" /></div>
            <div className="w-full">
                <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Chọn Trạm Quan Trắc</p>
                <div className="relative w-full">
                    <select 
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-[10px] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors appearance-none"
                        value={selectedStationId}
                        onChange={(e) => setSelectedStationId(e.target.value)}
                        disabled={loading}
                    >
                        {weatherList.map((station) => (
                            <option key={station.id} value={station.id}>
                                {station.address?.addressLocality || station.name?.value || station.id.split(':').pop()}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>
         </div>


         {/* THỜI GIAN & ID CẢM BIẾN */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-gray-100 rounded-full shrink-0"><CalendarDays className="w-5 h-5 text-gray-600" /></div>
                <div>
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Thời Gian Hiển Thị</p>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button onClick={() => setTimeRange(24)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === 24 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>24 Giờ</button>
                        <button onClick={() => setTimeRange(168)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === 168 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>7 Ngày</button>
                        <button onClick={() => setTimeRange(720)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === 720 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>30 Ngày</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1.5 text-xs w-full md:w-auto pl-4">
                 <div className="flex items-center justify-between w-full md:w-auto gap-3">
                     <span className="text-gray-500 whitespace-nowrap">ID Thời tiết:</span>
                     <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {selectedStationId.split(':').pop()}
                     </span>
                 </div>
                 
                 <div className="flex items-center justify-between w-full md:w-auto gap-3">
                     <span className="text-gray-500 whitespace-nowrap">Liên kết AQI:</span>
                     {linkedAirInfo.status !== 'none' ? (
                         <span className={`font-mono font-bold px-2 py-0.5 rounded border ${linkedAirInfo.status === 'exact' ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                             {linkedAirInfo.id.split(':').pop()}
                         </span>
                     ) : (
                         <span className="font-bold text-gray-400 italic">--</span>
                     )}
                 </div>
            </div>
         </div>
      </div>


      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Biểu đồ Nhiệt độ</h3><p className="text-sm text-gray-500">Dữ liệu {getTimeLabel()} </p></div>
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
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Lượng mưa</h3><p className="text-sm text-gray-500">Dữ liệu {getTimeLabel()} </p></div>
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
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Chất lượng không khí (AQI)</h3><p className="text-sm text-gray-500">Dữ liệu {getTimeLabel()} </p></div>
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