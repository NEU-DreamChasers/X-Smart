// frontend/src/components/CitizenReportHistory.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getMyReports, NgsiReport } from '../services/report.service';
import { Clock, CheckCircle2, XCircle, AlertCircle, MapPin, Calendar, Loader2, History } from 'lucide-react';

// ĐÃ XÓA: const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

// Helper map trạng thái
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

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const data = await getMyReports();
    // Sắp xếp mới nhất lên đầu
    const sorted = data.sort((a, b) =>
      new Date(b.dateObserved?.value || '').getTime() - new Date(a.dateObserved?.value || '').getTime()
    );
    setReports(sorted);
    setIsLoading(false);
  };

  return (
    // ĐÃ XÓA: style={borderStyle} khỏi div này
    <div className="bg-white rounded-[14px] shadow-sm h-full flex flex-col">
      {/* ĐÃ XÓA: border-b border-gray-100 khỏi div này */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Lịch sử gửi báo cáo
        </h2>
        <p className="text-gray-500 text-xs mt-1">Theo dõi trạng thái xử lý các phản ánh của bạn</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[600px] space-y-3">
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
            const dateValue = report.dateObserved?.value;
            const dateStr = dateValue ? new Date(dateValue).toLocaleDateString('vi-VN', {
               day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
            }) : 'Vừa xong';

            // Xử lý description nếu có format [Title] Description
            let displayTitle = report.description?.value || '';
            let displayDesc = '';

            if (typeof report.description?.value === 'string' && report.description.value.includes(']')) {
                const parts = report.description.value.split(']');
                displayTitle = parts[0].replace('[', '');
                displayDesc = parts[1];
            }

            return (
              <div
                key={report.id}
                // ĐÃ XÓA: border border-gray-100 khỏi className này
                // ĐÃ XÓA: hover:border-blue-200 khỏi className này
                className="group rounded-[12px] p-4 hover:shadow-sm transition-all bg-gray-50/50 hover:bg-white"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                     {displayTitle}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 whitespace-nowrap ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.text}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {displayDesc || 'Không có mô tả chi tiết'}
                </p>

                {/* ĐÃ XÓA: border-t border-gray-100 khỏi className này */}
                <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-2">
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
  );
}