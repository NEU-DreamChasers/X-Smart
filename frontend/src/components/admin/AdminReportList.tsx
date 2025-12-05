/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  getAdminReports, 
  approveReport, 
  rejectReport, 
  resolveReport,
  getReportById,
  NgsiReport 
} from '@/services/report.service';
import { 
  MapPin, Clock, AlertCircle, CheckCircle2, XCircle, 
  Search, Loader2, ShieldCheck, Check, X, RefreshCw,
  ImageIcon, Calendar, Eye, FileText, Filter
} from 'lucide-react';

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export default function AdminReportList() {
  const [reports, setReports] = useState<NgsiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<NgsiReport | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminReports();
      if (!Array.isArray(data)) {
        setReports([]);
        return;
      }
      const sorted = data.sort((a, b) => {
        const valA = a.dateObserved?.value;
        const valB = b.dateObserved?.value;
        return new Date(valB || 0).getTime() - new Date(valA || 0).getTime();
      });
      setReports(sorted);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const safeId = (id: any): string => (id === null || id === undefined) ? '' : String(id);
  const safeString = (val: any): string => (val === null || val === undefined) ? '' : (typeof val === 'object' ? JSON.stringify(val) : String(val));

  const formatReportId = (id: any) => {
    const str = safeId(id);
    return str.includes(':') ? str.split(':').pop()?.slice(0, 8) : str.slice(0, 8);
  };

  const formatDate = (isoString?: string) => {
    try {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    } catch { return 'Lỗi ngày'; }
  };

  const parseDescription = (rawVal: any) => {
    const raw = safeString(rawVal);
    if (raw.includes(']')) {
        const parts = raw.split(']');
        return { title: parts[0].replace('[', ''), desc: parts[1].trim() };
    }
    return { title: raw, desc: '' };
  };

  const handleAction = async (id: any, action: 'approve' | 'reject' | 'resolve') => {
    if(!window.confirm(`Bạn có chắc chắn muốn ${action}?`)) return;
    const idStr = safeId(id);
    setProcessingId(idStr);
    try {
      if (action === 'approve') await approveReport(idStr);
      if (action === 'reject') await rejectReport(idStr);
      if (action === 'resolve') await resolveReport(idStr);
      await fetchData(); 
      if (selectedReport && safeId(selectedReport.id) === idStr) setSelectedReport(null); 
    } catch (error) { alert('Lỗi cập nhật trạng thái.'); } finally { setProcessingId(null); }
  };

  const handleViewDetail = async (id: any) => {
      const idStr = safeId(id);
      const temp = reports.find(r => safeId(r.id) === idStr) || null;
      setSelectedReport(temp);
      try {
          const detail = await getReportById(idStr);
          if (detail) setSelectedReport(detail);
      } catch (e) { console.error(e); }
  };

  const filteredReports = reports.filter(r => 
    safeString(r.description?.value).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeString(r.address?.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (statusVal?: any) => {
    const s = safeString(statusVal).toUpperCase() || 'PENDING';
    if (s === 'RESOLVED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"><ShieldCheck className="w-3.5 h-3.5" /> Đã xong</span>;
    if (s === 'REJECTED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"><XCircle className="w-3.5 h-3.5" /> Đã từ chối</span>;
    if (s === 'APPROVED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100"><AlertCircle className="w-3.5 h-3.5" /> Chờ duyệt</span>;
  };

  const getCategoryStyle = (catVal?: any) => {
     const c = safeString(catVal).toLowerCase();
     if(c.includes('traffic')) return { label: 'Giao thông', bg: 'bg-red-50', text: 'text-red-700' };
     if(c.includes('weather')) return { label: 'Thời tiết', bg: 'bg-blue-50', text: 'text-blue-700' };
     if(c.includes('environment')) return { label: 'Môi trường', bg: 'bg-green-50', text: 'text-green-700' };
     return { label: 'Khác', bg: 'bg-gray-50', text: 'text-gray-700' };
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-[14px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" style={cardStyle}>
        
        {/* Title */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[12px] border border-indigo-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quản lý Phản ánh</h3>
            <p className="text-sm text-gray-500">Duyệt và xử lý các báo cáo từ người dân</p>
          </div>
        </div>

        {/* Toolbar: Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nội dung, địa chỉ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-[10px] text-sm outline-none border border-gray-200 focus:bg-white focus:border-indigo-500 transition-all"
                />
            </div>
            <button 
                onClick={fetchData} 
                disabled={isLoading} 
                className="p-2.5 bg-white text-gray-700 rounded-[10px] hover:bg-gray-50 border border-gray-200 shadow-sm active:scale-95 transition-all"
                title="Làm mới danh sách"
            >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      {/* --- LIST DATA --- */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading && reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[14px] shadow-sm" style={cardStyle}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2"/>
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
            </div>
        ) : filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[14px] shadow-sm" style={cardStyle}>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Filter className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-medium">Không tìm thấy phản ánh nào</p>
                <p className="text-xs text-gray-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc làm mới trang</p>
            </div>
        ) : (
            filteredReports.map((report) => {
                const idStr = safeId(report.id);
                const { title, desc } = parseDescription(report.description?.value);
                const catStyle = getCategoryStyle(report.category?.value);
                const mediaUrl = safeString(report.media?.value);
                const statusVal = safeString(report.status?.value);

                return (
                    <div key={idStr} className="bg-white p-5 rounded-[14px] hover:shadow-md transition-all group" style={cardStyle}>
                        <div className="flex flex-col md:flex-row gap-5">
                            {/* Thumbnail */}
                            <div className="w-full md:w-40 h-32 rounded-[12px] overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                                {mediaUrl ? (
                                    <img src={mediaUrl} alt="Thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                        <ImageIcon className="w-8 h-8 mb-1"/>
                                        <span className="text-[10px]">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-[6px] text-[10px] uppercase font-bold tracking-wider shadow-sm ${catStyle.bg} ${catStyle.text}`}>
                                        {catStyle.label}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={title || 'Không tiêu đề'}>
                                            {title || 'Báo cáo không tiêu đề'}
                                        </h3>
                                        {getStatusBadge(statusVal)}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{desc}</p>

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                                            {formatDate(safeString(report.dateObserved?.value))}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 max-w-[250px]">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="truncate">{safeString(report.address?.value) || 'Chưa có vị trí'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 flex gap-2 justify-end">
                                    {statusVal === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleAction(idStr, 'approve')} disabled={!!processingId} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-[10px] text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                                                <Check className="w-3.5 h-3.5"/> Duyệt
                                            </button>
                                            <button onClick={() => handleAction(idStr, 'reject')} disabled={!!processingId} className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-red-600 border border-red-200 rounded-[10px] text-xs font-bold hover:bg-red-50 transition-all active:scale-95">
                                                <X className="w-3.5 h-3.5"/> Từ chối
                                            </button>
                                        </>
                                    )}
                                    {statusVal === 'APPROVED' && (
                                        <button onClick={() => handleAction(idStr, 'resolve')} disabled={!!processingId} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-[10px] text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                                            <ShieldCheck className="w-3.5 h-3.5"/> Đã xử lý
                                        </button>
                                    )}
                                    <button onClick={() => handleViewDetail(idStr)} className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-[10px] text-xs font-bold hover:bg-gray-200 transition-all active:scale-95">
                                        <Eye className="w-3.5 h-3.5"/> Chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        Chi tiết #{formatReportId(selectedReport.id)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Người gửi: {safeString(selectedReport.reporter?.value) || 'Ẩn danh'}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-100"><X className="w-5 h-5 text-gray-500"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                 <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-[14px] border border-gray-100" style={cardStyle}>
                        <h4 className="font-bold text-sm mb-2 text-gray-900">Nội dung báo cáo</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{parseDescription(selectedReport.description?.value).desc || 'Không có nội dung'}</p>
                    </div>
                    {safeString(selectedReport.media?.value) && (
                        <div className="rounded-[14px] overflow-hidden border border-gray-100 shadow-sm">
                            <img src={safeString(selectedReport.media?.value)} className="w-full h-auto object-contain bg-gray-50" />
                        </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}