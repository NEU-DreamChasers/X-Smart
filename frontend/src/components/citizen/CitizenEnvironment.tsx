/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Sun, CloudRain, Loader2, MapPin, Search, RotateCcw } from 'lucide-react';
import { SimpleLineChart } from '../charts/SimpleLineChart';
import { SimpleBarChart } from '../charts/SimpleBarChart'; 
import { ApiService } from '../../services/api.service';

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

const airChartConfig = [
  { dataKey: 'value', stroke: '#3b82f6', name: 'AQI' }, 
];

const rainChartConfig = [
  { dataKey: 'value', fill: '#3b82f6', name: 'Lượng mưa (mm)' } 
];

export function CitizenEnvironment() {
  const [weather, setWeather] = useState<any>(null);
  const [airQualityChart, setAirQualityChart] = useState<any[]>([]);
  const [rainChart, setRainChart] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualCity, setManualCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = async (cityFilter?: string) => {
    setLoading(true);
    try {
      const weatherRes = await ApiService.weather.getAll();
      const weatherList = weatherRes.data;

      const weatherList = Array.isArray(weatherRes) ? weatherRes : (weatherRes.data || []);
      const airList = Array.isArray(airRes) ? airRes : (airRes.data || []);

      // 2. Tìm trạm thời tiết phù hợp
      let selectedWeather = null;

      if (cityFilter) {
        selectedWeather = weatherList.find((w: any) => 
            (w.name?.value || w.name || '').toLowerCase().includes(cityFilter.toLowerCase()) ||
            (w.address?.value?.addressLocality || w.address?.addressLocality || '').toLowerCase().includes(cityFilter.toLowerCase())
        );
      } else {
        selectedWeather = weatherList.length > 0 ? weatherList[0] : null;
      }

      setWeather(selectedWeather);

      if (selectedWeather) {
         const locationKey = selectedWeather.address?.addressLocality || 'Hanoi'; 
         
         const [aqiData, rainData] = await Promise.all([
             ApiService.history.getAqiChart(locationKey),
             ApiService.history.getRainChart(locationKey)
         ]);

         const formattedAqi = Array.isArray(aqiData) ? aqiData.map((item: any) => ({
             time: new Date(item.timestamp || item.dateObserved).getHours() + 'h',
             value: item.value || item.aqi || 0
         })) : [];
         const formattedRain = Array.isArray(rainData) ? rainData.map((item: any) => ({
             name: new Date(item.timestamp || item.dateObserved).getHours() + 'h',
             value: item.value || item.precipitation || 0
         })) : [];

         setAirQualityChart(formattedAqi);
         setRainChart(formattedRain);

      } else {
          setAirQualityChart([]);
          setRainChart([]);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setWeather(null);
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

  const translateWeather = (type: string) => {
      const map: Record<string, string> = {
          'Clear': 'Quang đãng',
          'Clouds': 'Có mây',
          'Rain': 'Mưa',
          'Drizzle': 'Mưa phùn',
          'Thunderstorm': 'Dông bão',
          'Mist': 'Sương mù'
      };
      return map[type] || type || 'Bình thường';
  };

  // Cấu hình các thẻ chỉ số (Cards)
  const displayConditions = weather ? [
    { 
      name: 'Thời tiết', 
      value: translateWeather(weather.weatherType), 
      status: `Cập nhật: ${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`, 
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
      status: (weather.relativeHumidity > 80) ? 'Ẩm ướt' : 'Thoải mái', 
      icon: Droplets, color: '#0092b8', bgColor: '#cefafe' 
    },
    { 
      name: 'Lượng mưa', 
      value: `${weather.precipitation ?? 0} mm`, 
      status: (weather.precipitation > 0) ? 'Đang mưa' : 'Không mưa', 
      icon: CloudRain, color: '#3b82f6', bgColor: '#eff6ff' 
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Search */}
      <div className="flex justify-between items-center px-1 h-10">
        {isEditing ? (
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 w-full max-w-md animate-in fade-in">
            <input 
              type="text" 
              placeholder="Nhập tên khu vực (VD: Hanoi)..." 
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
                {loading ? 'Đang tải...' : (weather?.address?.addressLocality || 'Chưa xác định vị trí')}
              </span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline font-medium">
              Đổi địa điểm
            </button>
            {locationMode === 'manual' && (
               <button onClick={() => { setLocationMode('gps'); loadData(); }} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                 <RotateCcw className="w-3 h-3" /> GPS
               </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Grid Cards (Chỉ số hiện tại) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
           <div className="col-span-full flex justify-center p-12 bg-white rounded-[14px]" style={borderStyle}>
             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
           </div>
        ) : !weather ? (
            <div className="col-span-full p-12 text-center bg-white rounded-[14px]" style={borderStyle}>
                <p className="text-gray-500 mb-2">Không tìm thấy dữ liệu quan trắc cho khu vực này.</p>
                <button onClick={() => loadData()} className="text-blue-600 text-sm hover:underline">Thử tải lại</button>
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

      {/* 3. Charts Section (Biểu đồ lịch sử) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ Không khí (AQI) */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chất lượng không khí (24h qua)</h3>
            <p className="text-sm text-gray-500">Chỉ số AQI theo thời gian</p>
          </div>
          <div className="w-full">
            {airQualityChart.length > 0 ? (
              <SimpleLineChart data={airQualityChart} xAxisKey="time" lines={airChartConfig} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                 {loading ? 'Đang tải...' : 'Chưa có dữ liệu lịch sử AQI'}
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ Lượng mưa */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Lượng mưa (24h qua)</h3>
            <p className="text-sm text-gray-500">Tổng lượng mưa (mm)</p>
          </div>
          <div className="w-full">
            {rainChart.length > 0 ? (
               <SimpleBarChart data={rainChart} xAxisKey="name" bars={rainChartConfig} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                 {loading ? 'Đang tải...' : 'Chưa có dữ liệu lịch sử mưa'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}