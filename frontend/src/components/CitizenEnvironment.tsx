'use client';

import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Sun, CloudRain, Loader2, MapPin, Search, RotateCcw } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart'; 
import { ApiService } from '../services/api.service';

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

// Cấu hình hiển thị biểu đồ
const airChartConfig = [
  { dataKey: 'value', stroke: '#3b82f6', name: 'AQI' }, // Giả sử API trả về field 'value'
];

const rainChartConfig = [
  { dataKey: 'value', fill: '#3b82f6', name: 'Lượng mưa (mm)' } // Giả sử API trả về field 'value'
];

export function CitizenEnvironment() {
  const [weather, setWeather] = useState<any>(null);
  const [airQualityChart, setAirQualityChart] = useState<any[]>([]);
  const [rainChart, setRainChart] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualCity, setManualCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Hàm helper để chuyển đổi dữ liệu Chart.js từ Backend sang Recharts (Frontend)
  const transformChartData = (apiData: any, labelKey: string = 'time') => {
     if (!apiData || !apiData.labels || !apiData.datasets) return [];
     
     const labels = apiData.labels;
     const values = apiData.datasets[0].data; 
     
     return labels.map((label: string, index: number) => ({
         [labelKey]: label,
         value: values[index] || 0
     }));
  };

  // --- HÀM TẢI DỮ LIỆU CHÍNH ---
  const loadData = async (cityFilter?: string) => {
    setLoading(true);
    try {
      // 1. Gọi song song cả Weather và Air
      const [weatherRes, airRes] = await Promise.all([
          ApiService.weather.getAll(100, 0),
          ApiService.air.getAll(100, 0)
      ]);

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

      // 3. Load biểu đồ lịch sử
      if (selectedWeather) {
         const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
         
         // --- TÌM TRẠM KHÔNG KHÍ TƯƠNG ỨNG ---
         // Logic: Tìm trạm Air có tọa độ trùng với trạm Weather
         let selectedAirId = '';
         
         // Lấy tọa độ Weather
         const wLoc = selectedWeather.location?.value?.coordinates || selectedWeather.location; // [lon, lat] hoặc {coordinates: ...}
         const wLon = Array.isArray(wLoc) ? wLoc[0] : wLoc?.coordinates?.[0];
         const wLat = Array.isArray(wLoc) ? wLoc[1] : wLoc?.coordinates?.[1];

         if (wLon && wLat) {
             const foundAir = airList.find((a: any) => {
                 const aLoc = a.location?.value?.coordinates || a.location;
                 const aLon = Array.isArray(aLoc) ? aLoc[0] : aLoc?.coordinates?.[0];
                 const aLat = Array.isArray(aLoc) ? aLoc[1] : aLoc?.coordinates?.[1];
                 
                 // So sánh tọa độ (làm tròn nhẹ để tránh sai số float)
                 return Math.abs(aLon - wLon) < 0.0001 && Math.abs(aLat - wLat) < 0.0001;
             });
             if (foundAir) selectedAirId = foundAir.id;
         }

         // Nếu không tìm thấy theo tọa độ, fallback về cách cũ (replace string) để cầu may
         if (!selectedAirId) {
             selectedAirId = selectedWeather.id.replace('Weather', 'AirQuality');
         }

         // --- GỌI API LỊCH SỬ ---
         const [aqiData, rainData] = await Promise.all([
            // Dùng ID thật vừa tìm được
            fetch(`${baseUrl}/history/chart?entityId=${encodeURIComponent(selectedAirId)}&attr=pm25`).then(r => r.json()),
            
            // ID Weather thì có sẵn rồi
            fetch(`${baseUrl}/history/chart?entityId=${encodeURIComponent(selectedWeather.id)}&attr=precipitation`).then(r => r.json())
         ]);

         setAirQualityChart(transformChartData(aqiData, 'time'));
         setRainChart(transformChartData(rainData, 'name'));

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

  // Helper hiển thị tên thời tiết
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