'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CloudRain, Wind, Bus, ParkingCircle, RefreshCw, 
  Database, Loader2, CheckCircle2, Play 
} from 'lucide-react';
import { ApiService, api } from '../services/api.service';

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminDataManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('weather');

  // State quản lý trạng thái Import
  const [isImporting, setIsImporting] = useState(false);

  // --- HÀM 1: LẤY DỮ LIỆU HIỂN THỊ ---
  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      let res = [];
      if (domain === 'weather') res = await ApiService.weather.getAll();
      else if (domain === 'air') res = await ApiService.air.getAll();
      else if (domain === 'bus') res = await ApiService.bus.getAll();
      else if (domain === 'parking') res = await ApiService.parking.getAll();
      setData(res);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [domain]);

  // --- HÀM 2: IMPORT TẤT CẢ DỮ LIỆU ---
  const handleImportAll = async () => {
    if (!confirm('Bạn có chắc muốn nhập TOÀN BỘ dữ liệu (Xe buýt, Bãi đỗ, POI) không?\nQuá trình này sẽ chạy ngầm và mất khoảng 1-2 phút.')) return;

    setIsImporting(true);
    try {
      // Gọi song song cả 3 API Import
      await Promise.all([
        api.post('/admin/import-static?category=bus'),
        api.post('/admin/import-static?category=parking'),
        api.post('/admin/import-static?category=poi')
      ]);
      
      alert('✅ Đã kích hoạt nhập liệu thành công cho tất cả các nguồn!\nDữ liệu sẽ dần xuất hiện trong vài phút tới.');
      
      // Đợi 3s rồi reload bảng để thấy những dữ liệu đầu tiên
      setTimeout(fetchData, 3000);

    } catch (error: any) {
      console.error("Import All error:", error);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const renderValue = (item: any) => {
    if (domain === 'weather') return <span className="text-orange-600 font-medium">{item.temperature?.toFixed(1)}°C - {item.humidity}%</span>;
    if (domain === 'air') return <span className="text-green-600 font-medium">AQI: {item.airQualityIndex}</span>;
    if (domain === 'bus') return <span className="text-blue-600">Tuyến số: {item.refBusRoute || 'N/A'}</span>;
    if (domain === 'parking') return <span className="text-purple-600 font-medium">{item.availableSpotNumber} chỗ trống</span>;
    return <span>--</span>;
  };

  const columns = [
    { header: 'ID Entity (NGSI-LD)', accessor: 'id', width: 'w-1/3' },
    { header: 'Loại', accessor: 'type', width: 'w-1/6' },
    { header: 'Giá trị chính', accessor: 'value', width: 'w-1/4' },
    { header: 'Cập nhật cuối', accessor: 'observedAt', width: 'w-1/4' },
  ];

  return (
    <div className="space-y-6">
      
      {/* --- PHẦN 1: PANEL ĐIỀU KHIỂN IMPORT --- */}
      <div className="bg-white p-6 rounded-[14px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" style={cardStyle}>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[14px] flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nhập dữ liệu Thành phố</h3>
            <p className="text-sm text-gray-500">
              Kích hoạt quy trình thu thập dữ liệu tĩnh từ OpenStreetMap (Xe buýt, Bãi đỗ, Địa điểm)
            </p>
          </div>
        </div>

        {/* NÚT BẤM DUY NHẤT */}
        <button
          onClick={handleImportAll}
          disabled={isImporting}
          className={`
            relative overflow-hidden group px-8 py-3 rounded-[12px] font-bold text-white transition-all 
            ${isImporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95'}
          `}
        >
          <div className="flex items-center gap-2 relative z-10">
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Bắt đầu Import Tất cả</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* --- PHẦN 2: BẢNG DỮ LIỆU --- */}
      <div className="bg-white p-6 rounded-[14px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={cardStyle}>
        <div>
            <h2 className="text-lg font-medium text-neutral-950">Giám sát Dữ liệu (Data Monitoring)</h2>
            <p className="text-sm text-gray-500">Xem dữ liệu hiện tại từ các Domain trong Context Broker</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-gray-50 text-neutral-900 rounded-[10px] hover:bg-gray-100 border border-gray-200 active:scale-95 transition-transform">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Tabs value={domain} onValueChange={setDomain} className="w-full">
        <TabsList className="inline-flex h-12 items-center bg-gray-100 p-1 rounded-full mb-6 w-full md:w-auto">
            <TabsTrigger value="weather" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><CloudRain className="w-4 h-4 mr-2"/> Thời tiết</TabsTrigger>
            <TabsTrigger value="air" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Wind className="w-4 h-4 mr-2"/> Không khí</TabsTrigger>
            <TabsTrigger value="bus" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Bus className="w-4 h-4 mr-2"/> Xe buýt</TabsTrigger>
            <TabsTrigger value="parking" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><ParkingCircle className="w-4 h-4 mr-2"/> Bãi đỗ</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-[14px] shadow-sm overflow-hidden" style={cardStyle}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className={`px-6 py-4 font-medium ${col.width}`}>{col.header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                <span>Đang tải dữ liệu...</span>
                              </div>
                            </td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                Chưa có dữ liệu. Hãy bấm nút <b>Bắt đầu Import Tất cả</b> ở trên.
                            </td></tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[200px]" title={item.id}>
                                      {item.id.replace('urn:ngsi-ld:', '')}
                                    </td>
                                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">{item.type}</span></td>
                                    <td className="px-6 py-4">{renderValue(item)}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {item.dateObserved ? new Date(item.dateObserved).toLocaleString('vi-VN') : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </Tabs>
    </div>
  );
}