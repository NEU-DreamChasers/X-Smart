'use client';

import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Sun, TrendingDown, TrendingUp, Loader2, MapPin, Search, RotateCcw } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { fetchWeather, fetchWeatherByCity, WeatherData } from '../lib/weather';

const airQualityData = [
  { time: '08:00', pm25: 45, pm10: 55 },
  { time: '10:00', pm25: 52, pm10: 62 },
  { time: '12:00', pm25: 48, pm10: 58 },
  { time: '14:00', pm25: 43, pm10: 53 },
  { time: '16:00', pm25: 39, pm10: 49 },
  { time: '18:00', pm25: 42, pm10: 52 },
];

const chartLinesConfig = [
  { dataKey: 'pm25', stroke: '#3b82f6', name: 'PM 2.5' },
  { dataKey: 'pm10', stroke: '#10b981', name: 'PM 10' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function CitizenEnvironment() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualCity, setManualCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadWeatherByGPS = () => {
    setLoading(true);
    setLocationMode('gps');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeather(latitude, longitude);
          setWeather(data);
          setLoading(false);
        },
        async (error) => {
          console.warn('GPS Error:', error);
          const data = await fetchWeather(10.7769, 106.7009); 
          setWeather(data);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    
    setLoading(true);
    setLocationMode('manual');
    const data = await fetchWeatherByCity(manualCity);
    setWeather(data);
    setLoading(false);
    setIsEditing(false);
  };
  useEffect(() => {
    loadWeatherByGPS();
  }, []);

  const displayConditions = weather ? [
    { name: 'Thời tiết', value: weather.description, status: `Cảm giác ${weather.feelsLike}°C`, icon: Sun, color: '#f59e0b', bgColor: '#fef3c7', trend: 'neutral', change: '' },
    { name: 'Nhiệt độ', value: `${weather.temp}°C`, status: 'Hiện tại', icon: Thermometer, color: '#f54900', bgColor: '#ffedd4', trend: 'up', change: '' },
    { name: 'Độ ẩm', value: `${weather.humidity}%`, status: weather.humidity > 70 ? 'Cao' : 'Bình thường', icon: Droplets, color: '#0092b8', bgColor: '#cefafe', trend: 'neutral', change: '' },
    { name: 'Gió & Áp suất', value: `${weather.windSpeed} m/s`, status: `${weather.pressure} hPa`, icon: Wind, color: '#00a63e', bgColor: '#d4f7e1', trend: 'neutral', change: '' },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Thanh công cụ vị trí */}
      <div className="flex justify-between items-center px-1 h-10">
        {isEditing ? (
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full max-w-md animate-in fade-in slide-in-from-left-2">
            <input 
              type="text" 
              placeholder="Nhập tên TP (VD: Hanoi, Da Nang)..." 
              className="px-3 py-1.5 rounded-md border text-sm outline-none focus:ring-2 ring-blue-500 w-full"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              autoFocus
            />
            <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700">
              <Search className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm px-2">
              Hủy
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <MapPin className={`w-4 h-4 ${locationMode === 'gps' ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className="font-medium">
                {loading ? 'Đang tải...' : (weather?.cityName || 'Không xác định')}
              </span>
            </div>
            
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Đổi địa điểm
            </button>

            {locationMode === 'manual' && (
               <button 
                 onClick={loadWeatherByGPS}
                 className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                 title="Dùng lại GPS"
               >
                 <RotateCcw className="w-3 h-3" /> GPS
               </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
           <div className="col-span-full flex justify-center p-12 bg-white rounded-[14px] border border-gray-100">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Đang cập nhật dữ liệu...</p>
             </div>
           </div>
        ) : (
          displayConditions.map((condition, index) => {
            const Icon = condition.icon;
            return (
              <div key={index} className="bg-white rounded-[14px] p-6 hover:shadow-sm transition-shadow" style={cardStyle}>
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-[10px] p-2 size-9" style={{ backgroundColor: condition.bgColor }}>
                    <Icon className="w-5 h-5" style={{ color: condition.color }} />
                  </div>
                </div>
                <p className="text-sm text-[#4a5565] mb-1">{condition.name}</p>
                <p className="text-base mb-2 font-medium capitalize" style={{ color: condition.color }}>{condition.value}</p>
                <div className="inline-block px-2 py-[2px] rounded-lg text-xs text-neutral-950" style={cardStyle}>
                  {condition.status}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white rounded-[14px] p-6" style={cardStyle}>
        <div className="mb-6">
          <h3 className="text-base font-medium text-neutral-950 mb-1">Xu hướng chất lượng không khí (Mock Data)</h3>
          <p className="text-sm text-[#4a5565]">Dữ liệu giả lập vì API miễn phí không hỗ trợ lịch sử</p>
        </div>
        <div className="w-full">
          <SimpleLineChart data={airQualityData} xAxisKey="time" lines={chartLinesConfig} height={250} />
        </div>
      </div>
    </div>
  );
}