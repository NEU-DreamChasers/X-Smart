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
import { ApiService } from '@/services/api.service';

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
  const [currentAirStation, setCurrentAirStation] = useState({ name: '', id: '' });

  // Helper: Chuyển đổi dữ liệu & Làm tròn số
  const transformChartData = (apiData: any) => {
    if (!apiData || !apiData.labels || !apiData.datasets?.[0]) return [];
    return apiData.labels.map((label: string, index: number) => {
        const rawVal = apiData.datasets[0].data[index];
        // Làm tròn 2 chữ số
        const value = typeof rawVal === 'number' ? Number(rawVal.toFixed(2)) : rawVal;
        
        return {
            time: label.split(' ')[1]?.slice(0, 5) || label, 
            value: value
        };
    });
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);

        // --- BƯỚC 1: THỐNG KÊ TỔNG QUAN (Giữ nguyên 4 Card) ---
        const [resWeather, resAir, resBus, resParking, resSources, resReports] = await Promise.all([
           ApiService.weather.getAll(1, 0).catch(() => ({ data: [], totalCount: 0 })),
           ApiService.air.getAll(1, 0).catch(() => ({ data: [], totalCount: 0 })),
           ApiService.bus.getAll(1, 0).catch(() => ({ data: [], totalCount: 0 })),
           ApiService.parking.getAll(1, 0).catch(() => ({ data: [], totalCount: 0 })),
           ApiService.sources.getAll(1, 0).catch(() => ({ data: [], totalCount: 0 })),
           // Giả lập API reports nếu chưa có
           Promise.resolve({ data: { totalReports: 0, byStatus: [] } }) 
        ]);

        const totalEnt = (resWeather.totalCount || 0) + (resAir.totalCount || 0) + (resBus.totalCount || 0) + (resParking.totalCount || 0);

        setStats({
            totalEntities: totalEnt,
            activeSensors: resSources.totalCount || 0,
            totalReports: 0, // Bạn có thể update từ resReports nếu có
            pendingReports: 0,
            apiHealth: 'Stable'
        });

        // --- BƯỚC 2: CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ ---
        
        // 1. Lấy danh sách trạm Thời tiết
        const weatherRes = await ApiService.weather.getAll(20, 0);
        const weatherList = weatherRes.data || [];
        
        // 2. Lấy danh sách trạm Không khí (Lấy nhiều để dễ tìm cặp)
        const airRes = await ApiService.air.getAll(100, 0);
        const airList = airRes.data || [];

        let targetLocation = '';
        let targetAirId = '';

        // --- LOGIC CHỌN TRẠM THỜI TIẾT ---
        if (weatherList.length > 0) {
            const firstStation = weatherList[0];
            targetLocation = firstStation.id;
            
            const shortId = firstStation.id.split(':').pop() || '';
            const name = firstStation.name?.value || firstStation.name || shortId;
            setCurrentStation({ name, id: shortId });

            // --- LOGIC CHỌN TRẠM KHÔNG KHÍ ---
            const wLoc = firstStation.location?.value?.coordinates || firstStation.location;
            
            console.log('🔍 Weather location:', wLoc);
            console.log('🔍 Số trạm Air có sẵn:', airList.length);
            
            if (wLoc && Array.isArray(wLoc)) { 
                const wLon = wLoc[0];
                const wLat = wLoc[1];
                
                // Cách 1: Tìm trạm trùng tọa độ
                const foundAir = airList.find((a: any) => {
                    const aLoc = a.location?.value?.coordinates || a.location;
                    if (!aLoc || !Array.isArray(aLoc)) return false;
                    return Math.abs(aLoc[0] - wLon) < 0.0001 && Math.abs(aLoc[1] - wLat) < 0.0001;
                });

                if (foundAir) {
                    targetAirId = foundAir.id;
                    setCurrentAirStation({ name: 'Khớp vị trí', id: targetAirId });
                    console.log('✅ Tìm thấy trạm Air khớp tọa độ:', targetAirId);
                } else {
                    console.log('⚠️ Không tìm thấy trạm Air khớp tọa độ');
                }
            }
        }
        
        // Fallback: Luôn dùng trạm Air đầu tiên nếu chưa có targetAirId
        if (!targetAirId && airList.length > 0) {
            targetAirId = airList[0].id;
            const airName = airList[0].name?.value || airList[0].name || targetAirId.split(':').pop() || targetAirId;
            setCurrentAirStation({ name: airName, id: targetAirId });
            console.warn("⚠️ Dùng trạm Air mặc định:", targetAirId);
        }

        await delay(500);
        
        // --- BƯỚC 3: GỌI API HISTORY ---
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        if (targetLocation) {
             // Nhiệt độ
             try {
                 const res = await fetch(`${baseUrl}/history/chart?entityId=${encodeURIComponent(targetLocation)}&attr=temperature&hours=24`);
                 setTempData(transformChartData(await res.json()));
             } catch (e) {}

             // Lượng mưa
             try {
                 const res = await fetch(`${baseUrl}/history/chart?entityId=${encodeURIComponent(targetLocation)}&attr=precipitation&hours=24`);
                 setPrecipData(transformChartData(await res.json()));
             } catch (e) {}
        }

        // AQI (Chắc chắn sẽ chạy nếu có trạm Air bất kỳ)
        if (targetAirId) {
             try {
                 console.log('🔍 Đang tải dữ liệu AQI cho:', targetAirId);
                 const res = await fetch(`${baseUrl}/history/chart?entityId=${encodeURIComponent(targetAirId)}&attr=pm25&hours=24`);
                 const json = await res.json();
                 console.log('📊 Dữ liệu AQI nhận được:', json);
                 const transformed = transformChartData(json);
                 console.log('📈 Dữ liệu AQI sau transform:', transformed);
                 setAqiData(transformed);
             } catch (e) { 
                 console.error("❌ Lỗi tải AQI:", e); 
             }
        } else {
            console.warn('⚠️ Không có targetAirId để tải dữ liệu AQI');
        }

      } catch (error) {
        console.error("Lỗi khởi tạo Admin Dashboard:", error);
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
      
      {/* --- PHẦN 1: CÁC CARD THỐNG KÊ (ĐÃ KHÔI PHỤC) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: IoT */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-blue-50 border border-blue-100"><Database className="w-5 h-5 text-blue-600" /></div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">IOT</span>
            </div>
            <p className="text-sm text-gray-500">Tổng Entity IoT</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.totalEntities}</p>
        </div>

        {/* Card 2: Nguồn */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-green-50 border border-green-100"><Wifi className="w-5 h-5 text-green-600" /></div>
            </div>
            <p className="text-sm text-gray-500">Nguồn dữ liệu</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.activeSensors}</p>
        </div>

        {/* Card 3: Phản ánh */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-orange-50 border border-orange-100"><FileText className="w-5 h-5 text-orange-600" /></div>
                {stats.pendingReports > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{stats.pendingReports} chờ duyệt</span>}
            </div>
            <p className="text-sm text-gray-500">Phản ánh người dân</p>
            <p className="text-2xl font-bold text-neutral-950 mt-1">{loading ? '...' : stats.totalReports}</p>
        </div>

        {/* Card 4: Hệ thống */}
        <div className="bg-white rounded-[14px] p-5 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-[10px] bg-purple-50 border border-purple-100"><Activity className="w-5 h-5 text-purple-600" /></div>
                <div className={`w-2 h-2 rounded-full ${stats.apiHealth === 'Stable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-sm text-gray-500">Hệ thống</p>
            <p className="text-xl font-bold text-neutral-950 mt-1 truncate">{stats.apiHealth}</p>
        </div>
      </div>

      {/* Thông tin trạm đang hiển thị */}
      <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
         <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-orange-500" />
            <span>Trạm Thời tiết: <b>{currentStation.name}</b></span>
         </div>
         {currentAirStation.id && (
            <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span>Trạm Không khí: <b>{currentAirStation.id.split(':').pop()}</b></span>
            </div>
         )}
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Nhiệt độ */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Biểu đồ Nhiệt độ</h3><p className="text-sm text-gray-500">Trung bình mỗi giờ (24h qua)</p></div>
          <div style={{ width: '100%', height: '250px' }}>
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             tempData.length > 0 ? (
                <ResponsiveContainer width="99%" height="100%">
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

        {/* 2. Lượng mưa */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Lượng mưa</h3><p className="text-sm text-gray-500">Tổng theo giờ (24h qua)</p></div>
          <div style={{ width: '100%', height: '250px' }}>
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             precipData.length > 0 ? (
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={precipData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                        <YAxis unit="mm" stroke="#888" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" name="Lượng mưa" radius={[4,4,0,0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <EmptyChart text="Không có mưa" />}
          </div>
        </div>
      </div>
      
      {/* 3. AQI (Đảm bảo hiển thị nhờ Fallback ID) */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
          <div className="mb-6"><h3 className="text-lg font-medium text-neutral-950">Chất lượng không khí (AQI)</h3><p className="text-sm text-gray-500">Bụi mịn PM2.5 (24h qua)</p></div>
          <div style={{ width: '100%', height: '250px' }}>
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500"/></div> : 
             aqiData.length > 0 ? (
                <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={aqiData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="PM2.5"/>
                    </LineChart>
                </ResponsiveContainer>
            ) : <EmptyChart text="Chưa có dữ liệu AQI" />}
          </div>
        </div>
    </div>
  );
}