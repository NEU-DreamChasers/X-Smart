'use client';

import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Sun, CloudRain, Loader2, MapPin, Search, RotateCcw } from 'lucide-react';
// Đảm bảo bạn có SimpleLineChart và SimpleBarChart (hoặc dùng Recharts trực tiếp như trước)
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart'; // Giả sử bạn có component này hoặc dùng Recharts
import { ApiService } from '../services/api.service';

// Define the exact border style
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

// Cấu hình biểu đồ không khí
const airChartConfig = [
  { dataKey: 'pm25', stroke: '#3b82f6', name: 'PM 2.5' },
  { dataKey: 'pm10', stroke: '#10b981', name: 'PM 10' },
];

// Cấu hình biểu đồ lượng mưa (Mới)
const rainChartConfig = [
  { dataKey: 'precipitation', fill: '#3b82f6', name: 'Lượng mưa (mm)' }
];

export function CitizenEnvironment() {
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any[]>([]);
  const [rainData, setRainData] = useState<any[]>([]); // State mới cho mưa
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualCity, setManualCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // FETCH DATA
  const loadData = async (cityFilter?: string) => {
    setLoading(true);
    try {
      const weatherList = await ApiService.weather.getAll();
      const airList = await ApiService.air.getAll();

      let selectedWeather = null;
      if (cityFilter) {
        selectedWeather = weatherList.find((w: any) => 
          w.address?.addressLocality?.toLowerCase().includes(cityFilter.toLowerCase())
        );
      } else {
        // Just take the first available sensor if no specific location filter
        selectedWeather = weatherList.length > 0 ? weatherList[0] : null;
      }

      setWeather(selectedWeather);

      // 1. Xử lý dữ liệu Không khí (Air Quality) cho Chart
      if (airList.length > 0) {
        const airChartData = airList.slice(0, 8).map((aq: any) => ({
          time: aq.dateObserved ? new Date(aq.dateObserved).getHours() + ':00' : 'Hiện tại',
          pm25: aq.pm25 ?? 0,
          pm10: aq.pm10 ?? 0
        }));
        setAirQuality(airChartData);
      } else {
        setAirQuality([]);
      }

      // 2. Xử lý dữ liệu Lượng mưa (Precipitation) cho Chart (Lấy từ weatherList hoặc API lịch sử nếu có)
      // Giả sử weatherList có trường precipitation hoặc ta dùng weatherList history
      if (weatherList.length > 0) {
         // Demo: Map dữ liệu weatherList thành lịch sử mưa (Nếu API trả về list history)
         // Nếu weatherList chỉ là current status của nhiều trạm, ta có thể hiển thị so sánh các trạm
         // Hoặc nếu bạn có API history riêng cho mưa, hãy gọi ở đây.
         // Tạm thời map từ weatherList (giả lập diễn biến theo trạm hoặc thời gian)
         const rainChartData = weatherList.slice(0, 8).map((w: any) => ({
            name: w.dateObserved ? new Date(w.dateObserved).getHours() + ':00' : 'Trạm ' + w.id.slice(-4), // Trục X
            precipitation: w.precipitation ?? 0 
         }));
         setRainData(rainChartData);
      } else {
          setRainData([]);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu môi trường:", error);
      setWeather(null);
      setAirQuality([]);
      setRainData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    setLocationMode('manual');
    loadData(manualCity);
    setIsEditing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Dịch trạng thái thời tiết
  const translateWeather = (type: string) => {
      const map: Record<string, string> = {
          'Clear': 'Quang đãng',
          'Clouds': 'Có mây',
          'Rain': 'Mưa',
          'Drizzle': 'Mưa phùn',
          'Thunderstorm': 'Dông bão',
          'Mist': 'Sương mù'
      };
      return map[type] || type || 'Không rõ';
  };

  const displayConditions = weather ? [
    { 
      name: 'Thời tiết', 
      value: translateWeather(weather.weatherType), 
      status: `Hôm nay: ${new Date().toLocaleDateString('vi-VN')}`, 
      icon: Sun, color: '#f59e0b', bgColor: '#fef3c7' 
    },
    { 
      name: 'Nhiệt độ', 
      value: `${(weather.temperature ?? 0).toFixed(1)}°C`, 
      status: 'Hiện tại', 
      icon: Thermometer, color: '#f54900', bgColor: '#ffedd4' 
    },
    { 
      name: 'Độ ẩm', 
      value: `${weather.relativeHumidity ?? 0}%`, 
      status: (weather.relativeHumidity > 70) ? 'Cao' : 'Bình thường', 
      icon: Droplets, color: '#0092b8', bgColor: '#cefafe' 
    },
    { 
      name: 'Lượng mưa', // Thay Gió bằng Mưa cho thẻ chính (hoặc giữ Gió thêm Mưa)
      value: `${weather.precipitation ?? 0} mm`, 
      status: (weather.precipitation > 0) ? 'Đang mưa' : 'Không mưa', 
      icon: CloudRain, color: '#3b82f6', bgColor: '#eff6ff' 
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Top Bar: Tìm kiếm & Vị trí */}
      <div className="flex justify-between items-center px-1 h-10">
        {isEditing ? (
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full max-w-md animate-in fade-in">
            <input 
              type="text" 
              placeholder="Nhập tên khu vực (VD: Quận 1)..." 
              className="px-3 py-1.5 rounded-[14px] text-sm outline-none focus:ring-2 ring-blue-500 w-full bg-white"
              style={borderStyle}
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              autoFocus
            />
            <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-[14px] hover:bg-blue-700">
              <Search className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 text-sm px-2">Hủy</button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-[14px] shadow-sm"
              style={borderStyle}
            >
              <MapPin className={`w-4 h-4 ${locationMode === 'gps' ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className="font-medium">
                {loading ? 'Đang tải...' : (weather?.address?.addressLocality || 'Chưa xác định')}
              </span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline font-medium">
              Đổi địa điểm
            </button>
            {locationMode === 'manual' && (
               <button onClick={() => { setLocationMode('gps'); loadData(); }} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                 <RotateCcw className="w-3 h-3" /> Đặt lại
               </button>
            )}
          </div>
        )}
      </div>

      {/* Grid Cards: Chỉ số hiện tại */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
           <div 
             className="col-span-full flex justify-center p-12 bg-white rounded-[14px] shadow-sm"
             style={borderStyle}
           >
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Đang cập nhật dữ liệu...</p>
             </div>
           </div>
        ) : !weather ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-[14px]" style={borderStyle}>
                Không tìm thấy dữ liệu thời tiết cho khu vực này.
            </div>
        ) : (
          displayConditions.map((condition, index) => {
            const Icon = condition.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow"
                style={borderStyle}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-[10px] p-2 size-9" style={{ backgroundColor: condition.bgColor }}>
                    <Icon className="w-5 h-5" style={{ color: condition.color }} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{condition.name}</p>
                <p className="text-2xl mb-2 font-semibold capitalize" style={{ color: condition.color }}>{condition.value}</p>
                <div className="inline-block px-2 py-1 rounded-[8px] text-xs font-medium bg-gray-50 text-gray-800 border border-gray-100">
                  {condition.status}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ Không khí */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chất lượng không khí</h3>
            <p className="text-sm text-gray-500">Chỉ số bụi mịn PM2.5 & PM10</p>
          </div>
          <div className="w-full">
            {airQuality.length > 0 ? (
              <SimpleLineChart data={airQuality} xAxisKey="time" lines={airChartConfig} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                 {loading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu không khí.'}
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ Lượng mưa (Mới) */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Lượng mưa</h3>
            <p className="text-sm text-gray-500">Diễn biến lượng mưa (mm)</p>
          </div>
          <div className="w-full">
            {rainData.length > 0 ? (
               // Sử dụng SimpleBarChart hoặc nếu chưa có thì dùng Recharts trực tiếp như ví dụ trước
               <SimpleBarChart data={rainData} xAxisKey="name" bars={rainChartConfig} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                 {loading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu mưa.'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}