/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Loader2, X} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiService } from "@/services/api.service";

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

type NotificationType = "info" | "warning" | "success" | "danger";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
  source?: string; 
}

export function CitizenNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndGenerateNotifications = async () => {
    const newNotifications: NotificationItem[] = [];

    try {
      // Logic: Air Quality
      const airData = await ApiService.air.getAll(1);
      if (airData.data.length > 0) {
        const currentAir = airData.data[0];
        const aqi = currentAir.airQualityIndex || currentAir.aqi;
        
        if (aqi && aqi > 150) {
            newNotifications.push({
                id: `air-danger-${new Date().getHours()}`,
                title: "Nguy hại sức khỏe",
                message: `AQI mức ĐỎ (${aqi}). Không nên ra ngoài trời lúc này.`,
                type: "danger",
                timestamp: new Date(),
                isRead: false,
                source: "Môi trường"
            });
        } else if (aqi && aqi > 100) {
             newNotifications.push({
                id: `air-warning-${new Date().getHours()}`,
                title: "Không khí kém",
                message: `Chất lượng không khí mức Vàng (${aqi}). Đeo khẩu trang khi ra đường.`,
                type: "warning",
                timestamp: new Date(),
                isRead: false,
                source: "Môi trường"
            });
        }
      }

      // Logic: Weather
      const weatherData = await ApiService.weather.getAll(1);
      if (weatherData.data.length > 0) {
        const w = weatherData.data[0];
        if (w.temperature > 37) {
            newNotifications.push({
                id: `weather-hot-${new Date().getHours()}`,
                title: "Cảnh báo Nắng nóng",
                message: `Nhiệt độ ${w.temperature}°C. Nguy cơ sốc nhiệt cao.`,
                type: "danger",
                timestamp: new Date(),
                isRead: false,
                source: "Thời tiết"
            });
        }
        
        if (w.temperature < 12) {
            newNotifications.push({
                id: `weather-cold-${new Date().getHours()}`,
                title: "Cảnh báo Rét đậm",
                message: `Nhiệt độ xuống thấp ${w.temperature}°C. Giữ ấm cơ thể.`,
                type: "warning",
                timestamp: new Date(),
                isRead: false,
                source: "Thời tiết"
            });
        }

        if (w.rain && w.rain > 50) { 
             newNotifications.push({
                id: `weather-rain-${new Date().getHours()}`,
                title: "Cảnh báo Mưa lớn",
                message: `Lượng mưa đạt ${w.rain}mm. Cảnh báo ngập lụt cục bộ.`,
                type: "danger",
                timestamp: new Date(),
                isRead: false,
                source: "Thời tiết"
            });
        }
      }

      // Logic: Reports
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
          try {
              const reportsData = await ApiService.reports.getMyReports();
              if (reportsData && reportsData.data) {
                  reportsData.data.forEach((report: any) => {
                      if (['RESOLVED', 'APPROVED', 'REJECTED'].includes(report.status)) {
                          const statusText = report.status === 'APPROVED' ? 'Đã duyệt' : (report.status === 'RESOLVED' ? 'Đã xử lý xong' : 'Bị từ chối');
                          const notiType = report.status === 'REJECTED' ? 'danger' : 'success';
                          
                          newNotifications.push({
                              id: `report-${report.id}-${report.status}`,
                              title: `Phản ánh: ${statusText}`,
                              message: `Báo cáo "${report.title}" của bạn đã cập nhật trạng thái.`,
                              type: notiType,
                              timestamp: new Date(report.updatedAt || new Date()),
                              isRead: false,
                              source: "Phản ánh"
                          });
                      }
                  });
              }
          } catch (err) {
             // silent fail
          }
      }

    } catch (error) {
      console.error("Lỗi cập nhật thông báo:", error);
    } finally {
      setNotifications(prev => {
        const existingMap = new Map(prev.map(item => [item.id, item]));
        
        newNotifications.forEach(newItem => {
            if (!existingMap.has(newItem.id)) {
                existingMap.set(newItem.id, newItem);
            }
        });

        return Array.from(existingMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGenerateNotifications();
    const interval = setInterval(fetchAndGenerateNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getTheme = (type: NotificationType) => {
    switch (type) {
      case "danger": 
        return { icon: AlertTriangle, color: '#ef4444', bgColor: '#fee2e2', borderClass: 'border-red-100' };
      case "warning": 
        return { icon: AlertTriangle, color: '#f59e0b', bgColor: '#fef3c7', borderClass: 'border-yellow-100' };
      case "success": 
        return { icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5', borderClass: 'border-green-100' };
      default: 
        return { icon: Info, color: '#3b82f6', bgColor: '#eff6ff', borderClass: 'border-blue-100' };
    }
  };

  return (
    <div 
      className="h-full w-full bg-white rounded-[14px] p-6 shadow-sm flex flex-col"
      style={borderStyle}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-[10px] text-blue-600">
                <Bell className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông báo & Cảnh báo</h3>
                <p className="text-sm text-gray-500">Cập nhật tin tức quan trọng</p>
            </div>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
      </div>
      
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-[calc(100vh-220px)] pr-4"> 
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400 border border-dashed border-gray-200 rounded-[14px] bg-gray-50">
                    <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Hiện tại không có cảnh báo nào</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const theme = getTheme(n.type);
                        const Icon = theme.icon;
                        const isReadStyle = n.isRead ? "opacity-60 grayscale-[0.5]" : "bg-white";

                        return (
                            <div 
                                key={n.id} 
                                onClick={() => markAsRead(n.id)}
                                className={cn(
                                    "relative group cursor-pointer transition-all hover:shadow-md p-4 rounded-[14px] border",
                                    isReadStyle,
                                    !n.isRead ? theme.borderClass : "border-gray-100" 
                                )}
                            >
                                <div className="flex gap-4">
                                    <div 
                                        className="shrink-0 rounded-[10px] p-2 w-10 h-10 flex items-center justify-center" 
                                        style={{ backgroundColor: theme.bgColor }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: theme.color }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={cn(
                                                "font-semibold text-sm truncate pr-2",
                                                n.isRead ? "text-gray-600" : "text-gray-900"
                                            )}>
                                                {n.title}
                                            </span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-[8px]">
                                                {n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                            {n.message}
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            {n.source && (
                                                <Badge variant="outline" className="text-[10px] font-normal text-gray-500 border-gray-200 bg-gray-50 h-5 px-2">
                                                    {n.source}
                                                </Badge>
                                            )}
                                            {!n.isRead && (
                                                <Badge className="text-[10px] h-5 px-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none">
                                                    Mới
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </ScrollArea>
      </div>
    </div>
  );
}