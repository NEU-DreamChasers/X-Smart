'use client';

import React, { useEffect, useState } from 'react';
import { getMyReports, getReportById, NgsiReport } from '../services/report.service';
import { Clock, CheckCircle2, XCircle, AlertCircle, MapPin, Calendar, Loader2, History, X, ImageIcon } from 'lucide-react';

const getStatusConfig = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PENDING':
      return { text: 'Đang chờ duyệt', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock };
    case 'APPROVED':
      return { text: 'Đã tiếp nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle };
    case 'RESOLVED':
      return { text: 'Đã xử lý', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    case 'REJECTED':
      return { text: 'Bị từ chối', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
    default:
      return { text: 'Không xác định', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: AlertCircle };
  }
};

interface Props {
  refreshTrigger?: number;
}

export default function CitizenReportHistory({ refreshTrigger = 0 }: Props) {
  const [reports, setReports] = useState<NgsiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<NgsiReport | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const data = await getMyReports();
    const sorted = data.sort((a, b) =>
      new Date(b.dateObserved?.value || '').getTime() - new Date(a.dateObserved?.value || '').getTime()
    );
    setReports(sorted);
    setIsLoading(false);
  };

  const handleViewDetail = async (id: string) => {
    // 1. Hiển thị ngay dữ liệu đang có trong list (Optimistic UI)
    const tempReport = reports.find(r => r.id === id) || null;
    setSelectedReport(tempReport);
    
    // 2. Gọi API lấy chi tiết đầy đủ
    try {
        const detailedReport = await getReportById(id);
        if (detailedReport) {
            setSelectedReport(detailedReport);
        }
    } catch (e) {
        console.error("Lỗi tải chi tiết:", e);
    }
  };

  const closeDetail = () => {
    setSelectedReport(null);
  };

  const parseDescription = (rawDesc: string) => {
      if (typeof rawDesc === 'string' && rawDesc.includes(']')) {
          const parts = rawDesc.split(']');
          return { title: parts[0].replace('[', ''), desc: parts[1].trim() };
      }
      return { title: rawDesc, desc: '' };
  };

  const formatDate = (dateVal: any) => {
      try {
          return dateVal ? new Date(dateVal).toLocaleString('vi-VN') : '--';
      } catch (e) {
          return 'Lỗi thời gian';
      }
  };

  // --- HÀM MỚI: Xử lý hiển thị ID an toàn ---
  const formatReportId = (id: any) => {
      if (!id) return '---';
      const idStr = String(id); // Ép kiểu về chuỗi để tránh lỗi .split is not a function
      if (idStr.includes(':')) {
          return idStr.split(':').pop()?.slice(0, 8);
      }
      return idStr.slice(0, 8);
  };

  return (
    <>
      <div className="bg-white rounded-[14px] shadow-sm h-full flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Lịch sử gửi báo cáo
          </h2>
          <p className="text-gray-500 text-xs mt-1">Theo dõi trạng thái xử lý các phản ánh của bạn</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[600px] space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Bạn chưa gửi báo cáo nào.
            </div>
          ) : (
            reports.map((report) => {
              const statusConfig = getStatusConfig(report.status?.value || 'PENDING');
              const StatusIcon = statusConfig.icon;
              const dateStr = formatDate(report.dateObserved?.value);
              const { title, desc } = parseDescription(report.description?.value || '');

              return (
                <div
                  key={report.id}
                  onClick={() => handleViewDetail(report.id)}
                  className="group rounded-[12px] p-4 bg-gray-50 hover:bg-blue-50/50 transition-all cursor-pointer border border-transparent hover:border-blue-100"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                       {title || 'Báo cáo không tiêu đề'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 whitespace-nowrap ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.text}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {desc || 'Không có mô tả chi tiết'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-100/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </div>
                    <div className="flex items-center gap-1 flex-1 line-clamp-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {report.address?.value || 'Chưa cập nhật vị trí'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div 
             className="bg-white w-full max-w-lg rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {parseDescription(selectedReport.description?.value || '').title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                       {/* SỬA LỖI Ở ĐÂY: Dùng hàm formatReportId */}
                       Mã đơn: <span className="font-mono bg-gray-100 px-1 rounded">{formatReportId(selectedReport.id)}</span>
                    </p>
                 </div>
                 <button onClick={closeDetail} className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-500 transition-all shadow-sm">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                 
                 <div className="flex items-center justify-between">
                    {(() => {
                         const statusConfig = getStatusConfig(selectedReport.status?.value || 'PENDING');
                         const StatusIcon = statusConfig.icon;
                         return (
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.text}
                            </div>
                         );
                    })()}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(selectedReport.dateObserved?.value)}
                    </span>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Hình ảnh sự cố</label>
                    {selectedReport.media?.value && typeof selectedReport.media.value === 'string' ? (
                        <div className="rounded-[14px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                            <img 
                                src={selectedReport.media.value} 
                                alt="Evidence" 
                                className="w-full h-auto max-h-[250px] object-cover" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="h-24 bg-gray-50 rounded-[14px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                             <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                             <span className="text-xs">Không có hình ảnh</span>
                        </div>
                    )}
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-[14px] border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Mô tả</label>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {parseDescription(selectedReport.description?.value || '').desc || 'Không có mô tả chi tiết'}
                        </p>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-[14px] border border-blue-100">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Vị trí</label>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-800">
                                {selectedReport.address?.value || 'Chưa cập nhật vị trí'}
                            </p>
                        </div>
                        
                        {Array.isArray(selectedReport.location?.value?.coordinates) && 
                         selectedReport.location!.value.coordinates.length >= 2 && (
                             <p className="text-xs text-blue-600 mt-2 pl-6 font-mono">
                                 GPS: {Number(selectedReport.location!.value.coordinates[1]).toFixed(6)}, {Number(selectedReport.location!.value.coordinates[0]).toFixed(6)}
                             </p>
                        )}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}
    </>
  );
}