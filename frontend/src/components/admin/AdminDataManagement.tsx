/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CloudRain, Wind, Bus, ParkingCircle, RefreshCw, 
  Loader2, Play, ChevronLeft, ChevronRight, Server, Lock, Map, BarChart3,
  MapPin, // Import cũ
  X, CheckCircle, AlertTriangle, AlertCircle, Database // [NEW] Import thêm icon cho Popup
} from 'lucide-react';
import { api, ApiService } from '../../services/api.service';
// Import Recharts để vẽ biểu đồ
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

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

  // [NEW] State quản lý Modal Popup
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

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


  // [UPDATED] Hàm mở Modal thay vì dùng confirm()
  const handleImportClick = () => {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập tài khoản Admin để sử dụng tính năng này!");
        return;
    }
    setImportStatus('idle');
    setShowImportModal(true);
  };

  // [UPDATED] Hàm thực hiện logic Import khi bấm "Xác nhận" trong Modal
  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      await Promise.all([
          api.post('/admin/import-static?category=bus'),
          api.post('/admin/import-static?category=parking'),
          api.post('/admin/import-static?category=poi')
      ]);
      
      setImportStatus('success');
      setImportMessage('Hệ thống đang thu thập dữ liệu mới từ OpenStreetMap. Quá trình này sẽ diễn ra ngầm trong 1-2 phút.');
      
      // Tự động tải lại sau 3s
      setTimeout(() => {
        fetchData();
        // Không đóng modal ngay để user đọc thông báo thành công
      }, 3000);

    } catch (error: any) {
      console.error("Import All error:", error);
      setImportStatus('error');
      setImportMessage(error.response?.data?.message || error.message);
    } finally {
      setIsImporting(false);
    }
  };

  // [NEW] Hàm đóng modal
  const handleCloseModal = () => {
    if (isImporting) return; // Không cho đóng khi đang chạy
    setShowImportModal(false);
    setImportStatus('idle');
  };

  const renderValue = (item: any) => {
    if (domain === 'weather') return <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-[8px] border border-orange-100">{item.temperature?.toFixed(1)}°C - {item.humidity}%</span>;
    if (domain === 'air') return <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-[8px] border border-green-100">AQI: {item.airQualityIndex}</span>;
    if (domain === 'bus') return <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-[8px] border border-blue-100">Tuyến số: {item.refBusRoute || 'N/A'}</span>;
    if (domain === 'parking') return <span className="text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-[8px] border border-purple-100">{item.availableSpotNumber} chỗ trống</span>;
    return <span className="text-gray-500">--</span>;
  };

  const renderLocation = (item: any) => {
    const loc = item.location;
    let coords = null;

    if (loc) {
        if (Array.isArray(loc.coordinates)) coords = loc.coordinates;
        else if (loc.value && Array.isArray(loc.value.coordinates)) coords = loc.value.coordinates;
    }

    if (coords && coords.length === 2) {
        const lat = coords[1];
        const lon = coords[0];
        return (
            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{lat.toFixed(5)}, {lon.toFixed(5)}</span>
            </div>
        );
    }
    return <span className="text-gray-400 text-xs italic">Không có toạ độ</span>;
  };

  // --- LOGIC BIỂU ĐỒ ---
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (domain === 'bus') {
        const routeCounts: Record<string, number> = {};
        data.forEach(item => {
            const route = item.refBusRoute || 'Khác';
            routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
        return Object.keys(routeCounts).map(route => ({
            name: `Tuyến ${route}`,
            value: routeCounts[route],
            id: route
        }));
    }

    return data.map(item => {
        let val = 0;
        let shortName = item.id.replace('urn:ngsi-ld:', '').split(':').pop() || item.id;
        if (shortName.length > 10) shortName = shortName.substring(0, 10) + '...';

        if (domain === 'weather') val = item.temperature || 0;
        if (domain === 'air') val = item.airQualityIndex || 0;
        if (domain === 'parking') val = item.availableSpotNumber || 0;

        return {
            name: shortName,
            value: val,
            fullId: item.id
        };
    });
  }, [data, domain]);

  const renderChart = () => {
    if (loading || chartData.length === 0) return null;

    let barColor = '#8884d8';
    let yLabel = 'Giá trị';
    
    if (domain === 'weather') { barColor = '#f97316'; yLabel = 'Nhiệt độ (°C)'; }
    if (domain === 'air') { barColor = '#10b981'; yLabel = 'Chỉ số AQI'; }
    if (domain === 'parking') { barColor = '#9333ea'; yLabel = 'Chỗ trống'; }
    if (domain === 'bus') { barColor = '#3b82f6'; yLabel = 'Số lượng xe'; }

    return (
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Thống kê {domain === 'bus' ? 'số lượng xe theo tuyến' : `giá trị ${yLabel} của danh sách bên dưới`}
                </h3>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#6b7280" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} 
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColor} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
  };

  const columns = [
    { header: 'ID Entity (NGSI-LD)', accessor: 'id', width: 'w-[30%]' },
    { header: 'Loại', accessor: 'type', width: 'w-[10%]' },
    { header: 'Toạ độ (Lat, Lon)', accessor: 'location', width: 'w-[20%]' },
    { header: 'Giá trị chính', accessor: 'value', width: 'w-[20%]' },
    { header: 'Cập nhật cuối', accessor: 'observedAt', width: 'w-[20%]' },
  ];

  const handleTabChange = (value: string) => {
    setDomain(value as DomainKeys);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* --- START: GIAO DIỆN MODAL POPUP --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                {importStatus === 'success' ? (
                   <span className="text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Thành công</span>
                ) : importStatus === 'error' ? (
                   <span className="text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Lỗi</span>
                ) : (
                   <span className="flex items-center gap-2"><Database className="w-5 h-5 text-indigo-600"/> Cập nhật dữ liệu</span>
                )}
              </h3>
              <button 
                onClick={handleCloseModal} 
                disabled={isImporting}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6">
              {importStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 border border-yellow-100">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-medium">Bạn có chắc chắn muốn cập nhật?</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Hệ thống sẽ tải lại toàn bộ dữ liệu <b>Xe buýt, Bãi đỗ, Địa điểm</b> từ OpenStreetMap.
                        Quá trình này có thể mất vài phút.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-gray-900 font-bold">Đã gửi lệnh cập nhật!</h4>
                  <p className="text-sm text-gray-500">{importMessage}</p>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="text-center py-4 space-y-3">
                   <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-red-600 font-bold">Có lỗi xảy ra</h4>
                  <p className="text-sm text-gray-500">{importMessage}</p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              {importStatus === 'idle' ? (
                <>
                  <button 
                    onClick={handleCloseModal}
                    disabled={isImporting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-70 flex items-center gap-2 transition-colors shadow-sm"
                  >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isImporting ? 'Đang xử lý...' : 'Xác nhận cập nhật'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Đóng cửa sổ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- END: GIAO DIỆN MODAL POPUP --- */}

      <div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[14px] shadow-sm"
        style={borderStyle}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[10px] border border-indigo-100">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cập nhật dữ liệu bản đồ</h2>
            <p className="text-sm text-gray-500">
              Kích hoạt quy trình đồng bộ dữ liệu tĩnh từ OpenStreetMap (Xe buýt, Bãi đỗ, Địa điểm)
            </p>
          </div>
        </div>

        <button
          onClick={handleImportClick} // [UPDATED] Gọi hàm mở modal
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
          title={!isLoggedIn ? "Vui lòng đăng nhập để sử dụng" : "Đồng bộ dữ liệu từ OSM"}
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              {!isLoggedIn ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Cập nhật dữ liệu bản đồ</span>
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
            
            {renderChart()}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-y border-gray-100">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className={`px-6 py-4 font-medium ${col.width}`}>{col.header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span>Đang tải dữ liệu...</span>
                              </div>
                            </td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                Chưa có dữ liệu. Hãy bấm nút <b>Cập nhật dữ liệu bản đồ</b> ở trên.
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
                                    <td className="px-6 py-4">
                                        {renderLocation(item)}
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