"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, AlertTriangle, CheckCircle2, Info, X, Loader2, 
  CloudRain, ThermometerSun, Wind 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ApiService } from "@/services/api.service";

// Định nghĩa kiểu dữ liệu
type NotificationType = "info" | "warning" | "success" | "danger";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
  source?: string; // Nguồn: Weather, Air, Report
}

export function CitizenNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LOGIC TỔNG HỢP DỮ LIỆU ---
  const fetchAndGenerateNotifications = async () => {
    // Không set loading = true ở đây để tránh nhấp nháy giao diện khi polling lại
    const newNotifications: NotificationItem[] = [];

    try {
      // 1. Kiểm tra Môi trường (Air)
      const airData = await ApiService.air.getAll(1);
      if (airData.data.length > 0) {
        const currentAir = airData.data[0];
        const aqi = currentAir.airQualityIndex || currentAir.aqi;
        
        if (aqi && aqi > 150) {
            newNotifications.push({
                id: `air-danger-${new Date().getHours()}`, // ID theo giờ để không spam
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

      // 2. Kiểm tra Thời tiết (Weather) - Bổ sung cảnh báo Mưa/Nhiệt độ
      const weatherData = await ApiService.weather.getAll(1);
      if (weatherData.data.length > 0) {
        const w = weatherData.data[0];
        
        // Cảnh báo Nóng
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
        
        // Cảnh báo Lạnh
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

        // Cảnh báo Mưa / Ngập (Giả định logic)
        // Lưu ý: check biến 'rain' hoặc 'precipitation' tùy vào dữ liệu thực tế API trả về
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

      // 3. Kiểm tra trạng thái Báo cáo (Reports)
      // CHỈ GỌI KHI CÓ TOKEN
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
          try {
              const reportsData = await ApiService.reports.getMyReports();
              if (reportsData && reportsData.data) {
                  reportsData.data.forEach((report: any) => {
                      // Chỉ báo khi đã xử lý xong hoặc được duyệt
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
              // Fail silently (không log lỗi 401 ra console để tránh rác log)
          }
      }

    } catch (error) {
      console.error("Lỗi cập nhật thông báo:", error);
    } finally {
      // Merge logic: Giữ lại các thông báo cũ, chỉ thêm mới nếu chưa có ID
      setNotifications(prev => {
        // Tạo Map từ mảng cũ để dễ kiểm tra
        const existingMap = new Map(prev.map(item => [item.id, item]));
        
        newNotifications.forEach(newItem => {
            // Nếu thông báo chưa tồn tại thì thêm vào
            if (!existingMap.has(newItem.id)) {
                existingMap.set(newItem.id, newItem);
            }
        });

        // Chuyển lại thành mảng và sắp xếp thời gian giảm dần
        return Array.from(existingMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGenerateNotifications();
    const interval = setInterval(fetchAndGenerateNotifications, 60000); // 1 phút check 1 lần
    return () => clearInterval(interval);
  }, []);

  // --- HELPER GIAO DIỆN ---
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "danger": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = (type: NotificationType, isRead: boolean) => {
    const base = "border-l-4 p-4 mb-3 rounded shadow-sm transition-all hover:shadow-md cursor-pointer relative";
    const readStyle = isRead ? "opacity-60 bg-gray-50 grayscale-[0.5]" : "bg-white";
    
    switch (type) {
      case "danger": return cn(base, readStyle, "border-l-red-500 border-t border-r border-b border-gray-100");
      case "warning": return cn(base, readStyle, "border-l-yellow-500 border-t border-r border-b border-gray-100");
      case "success": return cn(base, readStyle, "border-l-green-500 border-t border-r border-b border-gray-100");
      default: return cn(base, readStyle, "border-l-blue-500 border-t border-r border-b border-gray-100");
    }
  };

  return (
    <Card className="h-full w-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo & Cảnh báo
            </CardTitle>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-[calc(100vh-200px)] pr-4"> {/* Chiều cao động */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
                    <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                    <p>Hiện tại không có cảnh báo nào</p>
                </div>
            ) : (
                notifications.map((n) => (
                    <div 
                        key={n.id} 
                        className={getStyles(n.type, n.isRead)}
                        onClick={() => markAsRead(n.id)}
                    >
                        <div className="flex gap-3">
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm text-gray-900">{n.title}</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full">
                                        {n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                                <div className="mt-2 flex gap-2">
                                    {n.source && (
                                        <Badge variant="outline" className="text-[10px] font-normal text-gray-500">
                                            {n.source}
                                        </Badge>
                                    )}
                                    {!n.isRead && (
                                        <Badge className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none">
                                            Mới
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}