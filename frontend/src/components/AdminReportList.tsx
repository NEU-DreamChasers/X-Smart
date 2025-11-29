'use client';

import React, { useEffect, useState } from 'react';
import { getReports, NgsiReport } from '../services/report.service';
import { MapPin, Clock, AlertCircle, CheckCircle2, XCircle, Filter, Search, Loader2 } from 'lucide-react';

// Strict border style match
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export default function AdminReportList() {
  const [reports, setReports] = useState<NgsiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        // Sort by date (newest first)
        const sorted = data.sort((a, b) => {
            const dateA = new Date(a.dateObserved?.value || 0).getTime();
            const dateB = new Date(b.dateObserved?.value || 0).getTime();
            return dateB - dateA;
        });
        setReports(sorted);
      } catch (error) {
        console.error("Error loading reports", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper to get status color
  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'resolved' || s === 'completed') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"><CheckCircle2 className="w-3.5 h-3.5" /> Đã xử lý</span>;
    if (s === 'rejected') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100"><AlertCircle className="w-3.5 h-3.5" /> Chờ xử lý</span>;
  };

  // Helper to get category icon/color
  const getCategoryStyle = (category?: string) => {
     switch(category) {
        case 'traffic': return { label: 'Giao thông', bg: 'bg-red-50', text: 'text-red-700' };
        case 'weather': return { label: 'Thời tiết', bg: 'bg-blue-50', text: 'text-blue-700' };
        case 'environment': return { label: 'Môi trường', bg: 'bg-green-50', text: 'text-green-700' };
        case 'infrastructure': return { label: 'Hạ tầng', bg: 'bg-orange-50', text: 'text-orange-700' };
        default: return { label: 'Khác', bg: 'bg-gray-50', text: 'text-gray-700' };
     }
  };

  if (isLoading) {
    return (
        <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Đang tải dữ liệu phản ánh...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm phản ánh..." 
              className="w-full pl-10 pr-4 py-2 bg-white rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              style={borderStyle}
            />
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-[14px] hover:bg-gray-50 transition-colors" style={borderStyle}>
                <Filter className="w-4 h-4" />
                Lọc trạng thái
            </button>
         </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[14px]" style={borderStyle}>
                <p className="text-gray-500 text-sm">Chưa có phản ánh nào được ghi nhận.</p>
            </div>
        ) : (
            reports.map((report) => {
                const catStyle = getCategoryStyle(report.category?.value);
                return (
                    <div key={report.id} className="bg-white p-4 rounded-[14px] hover:shadow-md transition-shadow group cursor-pointer" style={borderStyle}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Image Thumbnail */}
                            {report.media?.value ? (
                                <div className="w-full md:w-32 h-32 rounded-[10px] overflow-hidden shrink-0 border border-black/5 bg-gray-100">
                                    <img src={report.media.value} alt="Evidence" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-full md:w-32 h-32 rounded-[10px] bg-gray-50 shrink-0 border border-black/5 flex items-center justify-center text-gray-300">
                                    <span className="text-xs">Không có ảnh</span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${catStyle.bg} ${catStyle.text}`}>
                                            {catStyle.label}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(report.dateObserved?.value)}
                                        </span>
                                    </div>
                                    {getStatusBadge(report.status?.value)}
                                </div>

                                <h3 className="text-gray-900 font-semibold line-clamp-1">
                                    {report.description?.value || 'Không có mô tả'}
                                </h3>

                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{typeof report.address?.value === 'string' ? report.address.value : 'Vị trí không xác định'}</span>
                                </div>

                                <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Người gửi: {report.reporter?.value || 'Ẩn danh'}</span>
                                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Xem chi tiết &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
}