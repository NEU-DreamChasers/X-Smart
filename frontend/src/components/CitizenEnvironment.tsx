'use client';

import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Sun, Loader2, MapPin, Search, RotateCcw } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { ApiService } from '../services/api.service';

// Define the exact border style
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

const chartLinesConfig = [
  { dataKey: 'pm25', stroke: '#3b82f6', name: 'PM 2.5' },
  { dataKey: 'pm10', stroke: '#10b981', name: 'PM 10' },
];

export function CitizenEnvironment() {
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any[]>([]);
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

      // Process Air Quality for Chart
      if (airList.length > 0) {
        const chartData = airList.slice(0, 8).map((aq: any) => ({
          time: aq.dateObserved ? new Date(aq.dateObserved).getHours() + ':00' : 'Now',
          pm25: aq.pm25 ?? 0,
          pm10: aq.pm10 ?? 0
        }));
        setAirQuality(chartData);
      } else {
        setAirQuality([]);
      }

    } catch (error) {
      console.error("Error loading environment data:", error);
      setWeather(null);
      setAirQuality([]);
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

  const displayConditions = weather ? [
    { 
      name: 'Thời tiết', 
      value: weather.weatherType || 'Clear', 
      status: `H.nay: ${new Date().toLocaleDateString('vi-VN')}`, 
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
      name: 'Gió', 
      value: `${weather.windSpeed ?? 0} m/s`, 
      status: `Hướng: ${weather.windDirection ?? 'N/A'}`, 
      icon: Wind, color: '#00a63e', bgColor: '#d4f7e1' 
    },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-1 h-10">
        {isEditing ? (
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full max-w-md animate-in fade-in">
            <input 
              type="text" 
              placeholder="Nhập tên khu vực (VD: District 1)..." 
              className="px-3 py-1.5 rounded-[14px] text-sm outline-none focus:ring-2 ring-blue-500 w-full"
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
                {loading ? 'Đang tải...' : (weather?.address?.addressLocality || 'Chưa có dữ liệu')}
              </span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline font-medium">
              Đổi địa điểm
            </button>
            {locationMode === 'manual' && (
               <button onClick={() => { setLocationMode('gps'); loadData(); }} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                 <RotateCcw className="w-3 h-3" /> Reset
               </button>
            )}
          </div>
        )}
      </div>

      {/* Grid Cards */}
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

      {/* Charts */}
      <div 
        className="bg-white rounded-[14px] p-6 shadow-sm"
        style={borderStyle}
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Xu hướng chất lượng không khí</h3>
          <p className="text-sm text-gray-500">Chỉ số PM2.5 và PM10 theo thời gian thực</p>
        </div>
        <div className="w-full">
          {airQuality.length > 0 ? (
            <SimpleLineChart data={airQuality} xAxisKey="time" lines={chartLinesConfig} height={250} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
               {loading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu biểu đồ.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}