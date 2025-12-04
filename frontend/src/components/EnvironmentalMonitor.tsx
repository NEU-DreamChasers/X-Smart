/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Wind, Droplets, Thermometer, Sun, Cloud, AlertTriangle, Search, RotateCcw, MapPin, Loader2 } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart';
import { fetchWeather, fetchWeatherByCity, WeatherData } from '../lib/weather';

const airQualityData = [
  { time: '00:00', pm25: 35, pm10: 45, co2: 380 },
  { time: '04:00', pm25: 28, pm10: 38, co2: 375 },
  { time: '08:00', pm25: 65, pm10: 78, co2: 420 },
  { time: '12:00', pm25: 58, pm10: 72, co2: 410 },
  { time: '16:00', pm25: 72, pm10: 85, co2: 435 },
  { time: '20:00', pm25: 48, pm10: 58, co2: 395 },
];

const weatherData = [
  { day: 'T2', temp: 28, humidity: 65, rain: 0 },
  { day: 'T3', temp: 29, humidity: 68, rain: 5 },
  { day: 'T4', temp: 27, humidity: 72, rain: 15 },
  { day: 'T5', temp: 26, humidity: 75, rain: 25 },
  { day: 'T6', temp: 28, humidity: 70, rain: 10 },
  { day: 'T7', temp: 30, humidity: 65, rain: 0 },
  { day: 'CN', temp: 31, humidity: 63, rain: 0 },
];

const districtAirQuality = [
  { district: 'Quận 1', quality: 85 },
  { district: 'Quận 2', quality: 92 },
  { district: 'Quận 3', quality: 78 },
  { district: 'Quận 4', quality: 88 },
  { district: 'Quận 5', quality: 80 },
  { district: 'Quận 6', quality: 86 },
];

const sensors = [
  { id: 'S001', location: 'Quận 1 - Trung tâm', status: 'Tốt', pm25: 42, temp: 28, humidity: 65 },
  { id: 'S002', location: 'Quận 2 - Khu CN', status: 'Trung bình', pm25: 68, temp: 30, humidity: 72 },
  { id: 'S003', location: 'Quận 3 - Khu dân cư', status: 'Tốt', pm25: 38, temp: 27, humidity: 68 },
  { id: 'S004', location: 'Quận 4 - Gần sông', status: 'Rất tốt', pm25: 25, temp: 26, humidity: 75 },
];

const getAQIStatus = (value: number) => {
  if (value <= 50) return { label: 'Rất tốt', color: 'bg-green-500', textColor: 'text-green-700' };
  if (value <= 100) return { label: 'Tốt', color: 'bg-blue-500', textColor: 'text-blue-700' };
  if (value <= 150) return { label: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
  return { label: 'Kém', color: 'bg-red-500', textColor: 'text-red-700' };
};

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function EnvironmentalMonitor() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const loadWeather = async (lat?: number, lon?: number) => {
    setLoading(true);
    const data = await fetchWeather(lat, lon);
    setWeather(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    setLoading(true);
    const data = await fetchWeatherByCity(searchCity);
    setWeather(data);
    setLoading(false);
  };

  const handleResetGPS = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => loadWeather(position.coords.latitude, position.coords.longitude),
        () => loadWeather()
      );
    } else {
      loadWeather();
    }
  };

  useEffect(() => {
    handleResetGPS();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Control Bar: Location & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[14px] shadow-sm" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Khu vực quan trắc</p>
            <h3 className="font-bold text-neutral-900">
              {loading ? 'Đang cập nhật...' : weather?.cityName || 'Không xác định'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Nhập tên thành phố..." 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-9 w-[250px] rounded-[10px]"
              style={cardStyle}
            />
          </div>
          <Button type="submit" className="bg-neutral-900 text-white rounded-[10px] hover:bg-neutral-800">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tìm'}
          </Button>
          <Button type="button" variant="outline" onClick={handleResetGPS} className="rounded-[10px]" title="Vị trí của tôi">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Current Conditions Cards (Dynamic Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={cardStyle}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wind className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gió / Áp suất</p>
                {/* Replace static data with weather state */}
                <p className="text-gray-900 font-bold">
                  {weather ? `${weather.windSpeed} m/s` : '--'}
                </p>
                <Badge className="mt-1 bg-blue-50 text-blue-700 border-blue-200" variant="outline">
                  {weather ? `${weather.pressure} hPa` : '--'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Thermometer className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhiệt độ</p>
                <p className="text-gray-900 font-bold">
                  {weather ? `${weather.temp}°C` : '--'}
                </p>
                <Badge className="mt-1 bg-orange-50 text-orange-700 border-orange-200" variant="outline">
                  {weather?.description || 'Đang tải'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Độ ẩm</p>
                <p className="text-gray-900 font-bold">
                  {weather ? `${weather.humidity}%` : '--'}
                </p>
                <Badge className="mt-1 bg-cyan-50 text-cyan-700 border-cyan-200" variant="outline">
                  {weather ? `Cảm giác ${weather.feelsLike}°C` : '--'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Since Weather API doesn't provide UV in free tier easily, kept generic or use Icon */}
        <Card style={cardStyle}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời tiết</p>
                {/* Use description as main value here */}
                <p className="text-gray-900 font-bold capitalize">
                  {weather ? weather.description : '--'}
                </p>
                <Badge className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200" variant="outline">
                  Trực tuyến
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphs (Keep existing charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle>Chất lượng không khí (Mock)</CardTitle>
            <CardDescription>Theo dõi trong 24 giờ</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={airQualityData}
              xAxisKey="time"
              lines={[
                { dataKey: 'pm25', stroke: '#3b82f6', name: 'PM 2.5' },
                { dataKey: 'pm10', stroke: '#10b981', name: 'PM 10' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle>Chất lượng không khí theo quận</CardTitle>
            <CardDescription>Chỉ số trung bình</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={districtAirQuality}
              xAxisKey="district"
              bars={[
                { dataKey: 'quality', fill: '#3b82f6', name: 'Chỉ số' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Forecast & Sensors (Keep existing) */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle>Dự báo thời tiết 7 ngày</CardTitle>
          <CardDescription>Nhiệt độ, độ ẩm và lượng mưa</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={weatherData}
            xAxisKey="day"
            lines={[
              { dataKey: 'temp', stroke: '#f59e0b', name: 'Nhiệt độ (°C)' },
              { dataKey: 'humidity', stroke: '#06b6d4', name: 'Độ ẩm (%)' },
              { dataKey: 'rain', stroke: '#3b82f6', name: 'Mưa (mm)' },
            ]}
            height={250}
          />
        </CardContent>
      </Card>

      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle>Mạng lưới cảm biến</CardTitle>
          <CardDescription>Trạng thái các điểm quan trắc môi trường</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.map((sensor) => {
              const status = getAQIStatus(sensor.pm25);
              return (
                <div key={sensor.id} className="p-4 border rounded-[14px] hover:shadow-md transition-shadow" style={cardStyle}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-900 font-medium">{sensor.id}</p>
                      <p className="text-sm text-gray-600">{sensor.location}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">PM 2.5</p>
                      <p className={`mt-1 ${status.textColor} font-medium`}>{sensor.pm25} µg/m³</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nhiệt độ</p>
                      <p className="text-gray-900 mt-1">{sensor.temp}°C</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Độ ẩm</p>
                      <p className="text-gray-900 mt-1">{sensor.humidity}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}