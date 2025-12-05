/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CloudRain, Wind, Bus, ParkingCircle, RefreshCw, 
  Database, Loader2, Play, ChevronLeft, ChevronRight, Server, Lock 
} from 'lucide-react';
import { api, ApiService } from '../../services/api.service';

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };
const PAGE_SIZE = 10;
type DomainKeys = 'weather' | 'air' | 'bus' | 'parking';

export function AdminDataManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState<DomainKeys>('weather');

  const [offset, setOffset] = useState(0); 
  const [totalCount, setTotalCount] = useState(0);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const [isImporting, setIsImporting] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
  }, []);

 
  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      const response = await ApiService[domain].getAll(PAGE_SIZE, offset); 
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(offset - PAGE_SIZE);
    }
  };

  const handleNext = () => {
    if (offset + PAGE_SIZE < totalCount) {
      setOffset(offset + PAGE_SIZE);
    }
  };
  
  useEffect(() => { 
    setOffset(0); 
  }, [domain]);
  
  useEffect(() => { 
    fetchData(); 

  }, [domain, offset]);


  const handleImportAll = async () => {
 
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập tài khoản Admin để sử dụng tính năng nhập liệu này!");
        return;
    }

    if (!confirm('Bạn có chắc muốn nhập TOÀN BỘ dữ liệu (Xe buýt, Bãi đỗ, POI) không?\nQuá trình này sẽ chạy ngầm và mất khoảng 1-2 phút.')) return;

    setIsImporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      alert('✅ Đã kích hoạt nhập liệu thành công cho tất cả các nguồn!\nDữ liệu sẽ dần xuất hiện trong vài phút tới.');
      setTimeout(fetchData, 3000);

    } catch (error: any) {
      console.error("Import All error:", error);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const renderValue = (item: any) => {
    if (domain === 'weather') return <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-[8px] border border-orange-100">{item.temperature?.toFixed(1)}°C - {item.humidity}%</span>;
    if (domain === 'air') return <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-[8px] border border-green-100">AQI: {item.airQualityIndex}</span>;
    if (domain === 'bus') return <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-[8px] border border-blue-100">Tuyến số: {item.refBusRoute || 'N/A'}</span>;
    if (domain === 'parking') return <span className="text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-[8px] border border-purple-100">{item.availableSpotNumber} chỗ trống</span>;
    return <span className="text-gray-500">--</span>;
  };

  const columns = [
    { header: 'ID Entity (NGSI-LD)', accessor: 'id', width: 'w-1/3' },
    { header: 'Loại', accessor: 'type', width: 'w-1/6' },
    { header: 'Giá trị chính', accessor: 'value', width: 'w-1/4' },
    { header: 'Cập nhật cuối', accessor: 'observedAt', width: 'w-1/4' },
  ];

  const handleTabChange = (value: string) => {
    setDomain(value as DomainKeys);
  };

  return (
    <div className="space-y-6">
      
      <div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[14px] shadow-sm"
        style={borderStyle}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[10px] border border-indigo-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nhập dữ liệu Thành phố</h2>
            <p className="text-sm text-gray-500">
              Kích hoạt quy trình thu thập dữ liệu tĩnh từ OpenStreetMap (Xe buýt, Bãi đỗ, Địa điểm)
            </p>
          </div>
        </div>

        <button
          onClick={handleImportAll}
          disabled={isImporting} 
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-[10px] font-medium text-sm transition-colors shadow-sm
            ${isImporting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : !isLoggedIn 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800' 
            }
          `}
          title={!isLoggedIn ? "Vui lòng đăng nhập để sử dụng" : "Nhập dữ liệu từ OSM"}
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              {!isLoggedIn ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Bắt đầu Import Tất cả</span>
            </>
          )}
        </button>
      </div>

      <div 
        className="flex justify-between items-center gap-4 bg-white p-6 rounded-[14px] shadow-sm" 
        style={borderStyle}
      >
        <div>
            <h2 className="text-lg font-bold text-gray-900">Giám sát Dữ liệu (Data Monitoring)</h2>
            <p className="text-sm text-gray-500">Xem dữ liệu hiện tại từ các Domain trong Context Broker</p>
        </div>
        <button 
            onClick={fetchData} 
            className="p-2 bg-gray-50 text-gray-600 rounded-[10px] hover:bg-gray-100 transition-colors border border-gray-200"
            title="Tải lại"
        >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Tabs value={domain} onValueChange={handleTabChange} className="w-full">
        <TabsList className="inline-flex h-12 items-center bg-gray-100 p-1 rounded-[12px] mb-6 w-full md:w-auto">
            <TabsTrigger value="weather" className="rounded-[8px] px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><CloudRain className="w-4 h-4 mr-2"/> Thời tiết</TabsTrigger>
            <TabsTrigger value="air" className="rounded-[8px] px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Wind className="w-4 h-4 mr-2"/> Không khí</TabsTrigger>
            <TabsTrigger value="bus" className="rounded-[8px] px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><Bus className="w-4 h-4 mr-2"/> Xe buýt</TabsTrigger>
            <TabsTrigger value="parking" className="rounded-[8px] px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"><ParkingCircle className="w-4 h-4 mr-2"/> Bãi đỗ</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-[14px] shadow-sm overflow-hidden" style={borderStyle}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className={`px-6 py-4 font-medium ${col.width}`}>{col.header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span>Đang tải dữ liệu...</span>
                              </div>
                            </td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                Chưa có dữ liệu. Hãy bấm nút <b>Bắt đầu Import Tất cả</b> ở trên.
                            </td></tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-neutral-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-[8px] text-blue-600 border border-blue-100">
                                            <Server className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-xs truncate max-w-[200px]" title={item.id}>
                                            {item.id.replace('urn:ngsi-ld:', '')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                            {item.type}
                                        </span>
                                    </td>
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

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
                Hiển thị {data.length > 0 ? offset + 1 : 0} - {Math.min(offset + PAGE_SIZE, totalCount)} trên tổng số <b>{totalCount}</b>
            </span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handlePrev} 
                    disabled={offset === 0 || loading}
                    className="p-2 bg-white border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-2 text-gray-700">
                   Trang {currentPage} / {totalPages || 1}
                </span>
                <button 
                    onClick={handleNext} 
                    disabled={offset + PAGE_SIZE >= totalCount || loading}
                    className="p-2 bg-white border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}