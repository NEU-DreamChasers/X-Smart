'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CloudRain, Wind, Bus, ParkingCircle, RefreshCw, ChevronLeft, ChevronRight, Eye, MapPin } from 'lucide-react';
import { ApiService } from '../services/api.service';

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };
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

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      const response = await ApiService[domain].getAll(PAGE_SIZE, offset); 
      
      setData(response.data);
      setTotalCount(response.totalCount)
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };


  // LOGIC ĐIỀU KHIỂN CHUYỂN TRANG
  const handlePrev = () => {
    if (offset > 0) {
      setOffset(offset - PAGE_SIZE);
    }
  };

  const handleNext = () => {
    if (data.length === PAGE_SIZE) {
      setOffset(offset + PAGE_SIZE);
    }
  };
  
  useEffect(() => { 
    setOffset(0); 
  }, [domain]);
  
  useEffect(() => { 
    fetchData(); 
  }, [domain, offset]);

  // Helper render giá trị tùy theo domain
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

  const handleTabChange = (value: string) => {
  setDomain(value as DomainKeys);
  setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[14px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={cardStyle}>
        <div>
            <h2 className="text-lg font-medium text-neutral-950">Giám sát Dữ liệu (Data Monitoring)</h2>
            <p className="text-sm text-gray-500">Xem dữ liệu hiện tại từ các Domain trong Context Broker</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-gray-50 text-neutral-900 rounded-[10px] hover:bg-gray-100 border border-gray-200">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>


      <Tabs value={domain} onValueChange={handleTabChange} className="w-full">
        <TabsList className="inline-flex h-12 items-center bg-gray-100 p-1 rounded-full mb-6 w-full md:w-auto">
            <TabsTrigger value="weather" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"><CloudRain className="w-4 h-4 mr-2"/> Thời tiết</TabsTrigger>
            <TabsTrigger value="air" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Wind className="w-4 h-4 mr-2"/> Không khí</TabsTrigger>
            <TabsTrigger value="bus" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Bus className="w-4 h-4 mr-2"/> Xe buýt</TabsTrigger>
            <TabsTrigger value="parking" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"><ParkingCircle className="w-4 h-4 mr-2"/> Bãi đỗ</TabsTrigger>
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
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Không có dữ liệu nào trong Domain này.</td></tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[200px]" title={item.id}>{item.id}</td>
                                    <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">{item.type}</span></td>
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

          { /* FOOTER PHÂN TRANG */}
          {data.length > 0 && (
             <div className="p-4 flex justify-between items-center border-t border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-600">
                    Hiển thị {offset + 1} - {offset + data.length} trên tổng số <b> {totalCount} </b>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handlePrev} 
                        disabled={offset === 0 || loading}
                        className="p-1 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700 px-2">
                        Trang {currentPage}
                    </span>
                    
                    <button 
                        onClick={handleNext} 
                        disabled={offset + PAGE_SIZE >= totalCount || loading}
                        className="p-1 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}