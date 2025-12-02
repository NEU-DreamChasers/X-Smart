'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  getAdminReports, 
  approveReport, 
  rejectReport, 
  resolveReport, 
  NgsiReport 
} from '@/services/report.service'; // Đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn
import { 
  MapPin, Clock, AlertCircle, CheckCircle2, XCircle, 
  Search, Loader2, ShieldCheck, Check, X, RefreshCw 
} from 'lucide-react';

// Style cho viền nhẹ
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export default function AdminReportList() {
  const [reports, setReports] = useState<NgsiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Hàm gọi API lấy danh sách
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Gọi hàm từ report.service.ts
      const data = await getAdminReports();
      
      // Sắp xếp: Mới nhất lên đầu (dựa trên dateObserved)
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.dateObserved?.value || 0).getTime();
        const dateB = new Date(b.dateObserved?.value || 0).getTime();
        return dateB - dateA;
      });
      
      setReports(sorted);
    } catch (error) {
      console.error("Lỗi khi tải danh sách báo cáo:", error);
      // Bạn có thể thêm toast error tại đây nếu muốn
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Xử lý hành động (Duyệt/Từ chối/Xong)
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'resolve') => {
    // Xác nhận trước khi thao tác
    if(!window.confirm('Bạn có chắc chắn muốn thực hiện hành động này?')) return;
    
    setProcessingId(id);
    try {
      if (action === 'approve') await approveReport(id);
      if (action === 'reject') await rejectReport(id);
      if (action === 'resolve') await resolveReport(id);
      
      // Sau khi thành công, gọi lại API để cập nhật danh sách mới nhất
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    } finally {
      setProcessingId(null);
    }
  };

  // --- Helper Functions ---
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toUpperCase() || 'PENDING';
    if (s === 'RESOLVED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"><ShieldCheck className="w-3.5 h-3.5" /> Đã xong</span>;
    if (s === 'REJECTED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"><XCircle className="w-3.5 h-3.5" /> Đã từ chối</span>;
    if (s === 'APPROVED') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100"><AlertCircle className="w-3.5 h-3.5" /> Chờ duyệt</span>;
  };

  const getCategoryStyle = (category?: string) => {
     switch(category) {
        case 'traffic': return { label: 'Giao thông', bg: 'bg-red-50', text: 'text-red-700' };
        case 'weather': return { label: 'Thời tiết', bg: 'bg-blue-50', text: 'text-blue-700' };
        case 'environment': return { label: 'Môi trường', bg: 'bg-green-50', text: 'text-green-700' };
        case 'infrastructure': return { label: 'Hạ tầng', bg: 'bg-orange-50', text: 'text-orange-700' };
        default: return { label: 'Khác', bg: 'bg-gray-50', text: 'text-gray-700' };
     }
  };

  // Filter theo Search Term
  const filteredReports = reports.filter(r => 
    r.description?.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address?.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && reports.length === 0) {
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
              placeholder="Tìm kiếm theo mô tả, địa chỉ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              style={borderStyle}
            />
         </div>
         
         {/* Nút Refresh thủ công */}
         <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-[14px] text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
            style={borderStyle}
         >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
         </button>
      </div>

      {/* List Reports */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[14px]" style={borderStyle}>
                <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có phản ánh nào được ghi nhận.'}
                </p>
            </div>
        ) : (
            filteredReports.map((report) => {
                // Lấy giá trị an toàn từ NGSI-LD format
                const categoryVal = report.category?.value;
                const descriptionVal = report.description?.value;
                const addressVal = report.address?.value;
                const dateVal = report.dateObserved?.value;
                const statusVal = report.status?.value?.toUpperCase() || 'PENDING';
                const mediaVal = report.media?.value;
                const reporterVal = report.reporter?.value;

                const catStyle = getCategoryStyle(categoryVal);
                const isProcessing = processingId === report.id;
                
                return (
                    <div key={report.id} className="bg-white p-4 rounded-[14px] hover:shadow-md transition-shadow group" style={borderStyle}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Image Thumbnail */}
                            {mediaVal ? (
                                <div className="w-full md:w-32 h-32 rounded-[10px] overflow-hidden shrink-0 border border-black/5 bg-gray-100 cursor-pointer" onClick={() => window.open(mediaVal, '_blank')}>
                                    <img src={mediaVal} alt="Evidence" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                </div>
                            ) : (
                                <div className="w-full md:w-32 h-32 rounded-[10px] bg-gray-50 shrink-0 border border-black/5 flex items-center justify-center text-gray-300">
                                    <span className="text-xs">Không ảnh</span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${catStyle.bg} ${catStyle.text}`}>
                                                {catStyle.label}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(dateVal)}
                                            </span>
                                        </div>
                                        {getStatusBadge(statusVal)}
                                    </div>

                                    <h3 className="text-gray-900 font-semibold line-clamp-2" title={descriptionVal}>
                                        {descriptionVal || 'Không có mô tả'}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{typeof addressVal === 'string' ? addressVal : 'Vị trí không xác định'}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">Người gửi: <span className="font-medium text-gray-600">{reporterVal}</span></div>
                                </div>

                                {/* ADMIN ACTIONS - LOGIC NÚT BẤM */}
                                <div className="pt-3 mt-3 border-t border-gray-100 flex gap-2 justify-end">
                                    {/* 1. Trạng thái PENDING: Hiện Duyệt / Từ chối */}
                                    {statusVal === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleAction(report.id, 'approve')}
                                                disabled={!!processingId}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                                            >
                                                {isProcessing && processingId === report.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" />}
                                                Duyệt
                                            </button>
                                            <button 
                                                onClick={() => handleAction(report.id, 'reject')}
                                                disabled={!!processingId}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                {isProcessing && processingId === report.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <X className="w-3 h-3" />}
                                                Từ chối
                                            </button>
                                        </>
                                    )}

                                    {/* 2. Trạng thái APPROVED: Hiện nút Hoàn tất (Đã xử lý xong) */}
                                    {statusVal === 'APPROVED' && (
                                        <button 
                                            onClick={() => handleAction(report.id, 'resolve')}
                                            disabled={!!processingId}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                                        >
                                            {isProcessing && processingId === report.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <ShieldCheck className="w-3 h-3" />}
                                            Xử lý xong
                                        </button>
                                    )}

                                    {/* Các trạng thái khác (RESOLVED, REJECTED) không hiện nút gì */}
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