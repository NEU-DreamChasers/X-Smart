/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiService, API_URL } from "@/services/api.service";
import { io } from "socket.io-client";

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

// Hàm helper để lấy giá trị an toàn từ cấu trúc NGSI-LD hoặc object thường
const safeValue = (val: any) => (val && typeof val === 'object' && 'value' in val) ? val.value : val;

export function CitizenNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Ref để lưu trạng thái report lần quét trước (dùng để so sánh sự thay đổi)
    const prevReportStatusRef = useRef<Record<string, string>>({});
    const isFirstLoad = useRef(true);

    // --- 1. Load dữ liệu từ LocalStorage & API ---
    useEffect(() => {
        // Khôi phục thông báo cũ từ LocalStorage (để không bị mất khi F5)
        const savedNotifs = localStorage.getItem('local_notifications');
        if (savedNotifs) {
            try {
                const parsed = JSON.parse(savedNotifs).map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
                setNotifications(parsed);
            } catch (e) { console.error("Lỗi parse local notifs", e); }
        }

        // Khôi phục snapshot trạng thái report
        const savedSnapshot = localStorage.getItem('report_status_snapshot');
        if (savedSnapshot) {
            try {
                prevReportStatusRef.current = JSON.parse(savedSnapshot);
                isFirstLoad.current = false; // Đã có dữ liệu cũ thì không phải lần đầu
            } catch (e) { }
        }

        fetchSystemNotifications();
        
        // Setup Polling: Quét thay đổi Report mỗi 5 giây
        const interval = setInterval(() => {
            checkReportStatusChanges();
            fetchSystemNotifications(); // Vẫn gọi API thông báo hệ thống nếu có
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // --- 2. Hàm lưu thông báo mới ---
    const addLocalNotification = (newNoti: NotificationItem) => {
        setNotifications(prev => {
            // Tránh trùng lặp ID
            if (prev.some(n => n.id === newNoti.id)) return prev;
            
            const updated = [newNoti, ...prev];
            // Lưu vào LocalStorage
            localStorage.setItem('local_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    // --- 3. Logic "Thông minh": Tự phát hiện thay đổi trạng thái Report ---
    const checkReportStatusChanges = async () => {
        try {
            const res = await ApiService.reports.getMyReports();
            const currentReports = res.data || [];
            
            const currentStatusMap: Record<string, string> = {};
            let hasChanges = false;

            currentReports.forEach((report: any) => {
                const id = String(report.id);
                const status = safeValue(report.status) || 'PENDING';
                const description = safeValue(report.description);
                
                // Lưu status hiện tại để dùng cho lần sau
                currentStatusMap[id] = status;

                // Nếu là lần đầu chạy app (chưa có snapshot cũ), chỉ lưu lại, không báo
                if (isFirstLoad.current) return;

                const oldStatus = prevReportStatusRef.current[id];

                // CASE A: Report mới được tạo (Trước đó chưa có ID này)
                if (!oldStatus) {
                    addLocalNotification({
                        id: `new-${id}`,
                        title: 'Gửi báo cáo thành công',
                        message: `Báo cáo "${formatDesc(description)}" của bạn đã được gửi lên hệ thống.`,
                        type: 'info',
                        timestamp: new Date(),
                        isRead: false,
                        source: 'Trợ lý ảo'
                    });
                    hasChanges = true;
                }
                // CASE B: Trạng thái thay đổi (PENDING -> APPROVED / REJECTED)
                else if (oldStatus !== status) {
                    if (status === 'APPROVED') {
                        addLocalNotification({
                            id: `appr-${id}-${Date.now()}`,
                            title: 'Báo cáo được duyệt ✅',
                            message: `Admin đã duyệt báo cáo "${formatDesc(description)}" của bạn.`,
                            type: 'success',
                            timestamp: new Date(),
                            isRead: false,
                            source: 'Ban Quản Trị'
                        });
                    } else if (status === 'REJECTED') {
                        addLocalNotification({
                            id: `rej-${id}-${Date.now()}`,
                            title: 'Báo cáo bị từ chối ❌',
                            message: `Báo cáo "${formatDesc(description)}" chưa phù hợp và đã bị từ chối.`,
                            type: 'danger',
                            timestamp: new Date(),
                            isRead: false,
                            source: 'Ban Quản Trị'
                        });
                    } else if (status === 'RESOLVED') {
                         addLocalNotification({
                            id: `res-${id}-${Date.now()}`,
                            title: 'Sự cố đã xử lý xong 🛠️',
                            message: `Vấn đề bạn phản ánh tại "${formatDesc(description)}" đã được xử lý hoàn tất.`,
                            type: 'success',
                            timestamp: new Date(),
                            isRead: false,
                            source: 'Đội xử lý sự cố'
                        });
                    }
                    hasChanges = true;
                }
            });

            // Cập nhật snapshot mới
            prevReportStatusRef.current = currentStatusMap;
            localStorage.setItem('report_status_snapshot', JSON.stringify(currentStatusMap));
            
            if (isFirstLoad.current) isFirstLoad.current = false;

        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái report:", error);
        }
    };

    // Helper: Cắt ngắn mô tả
    const formatDesc = (desc: any) => {
        const s = String(desc || 'Không tiêu đề');
        // Nếu có format [Tiêu đề] Nội dung, lấy tiêu đề
        if (s.includes(']')) return s.split(']')[0].replace('[', '');
        return s.length > 30 ? s.slice(0, 30) + '...' : s;
    };

    // --- 4. Lấy thông báo từ Backend (giữ nguyên logic cũ) ---
    const fetchSystemNotifications = async () => {
        try {
            const response = await ApiService.notifications.getAll();
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            
            // Chỉ lấy những cái chưa có trong list hiện tại (tránh duplicate với local)
            const newItems: NotificationItem[] = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                message: item.message,
                type: item.type?.toLowerCase() || 'info',
                timestamp: new Date(item.createdAt || item.timestamp),
                isRead: item.isRead,
                source: item.source || 'Hệ thống'
            }));

            setNotifications(prev => {
                // Merge backend notifications với local notifications
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueNewItems = newItems.filter(n => !existingIds.has(n.id));
                
                if (uniqueNewItems.length === 0) return prev;
                
                const combined = [...uniqueNewItems, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                return combined;
            });
            setLoading(false);
        } catch (error) {
            setLoading(false); // Silent fail
        }
    };

    // --- 5. Giữ lại Socket cho Global Alerts (như Cảnh báo thời tiết) ---
    useEffect(() => {
        const socket = io(API_URL, {
            transports: ['websocket'],
            auth: { token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null }
        });

        socket.on('global_alert', (data: any) => {
             addLocalNotification({
                id: data.id || `glob-${Date.now()}`,
                title: data.title,
                message: data.message,
                type: data.type?.toLowerCase() || 'warning',
                timestamp: new Date(),
                isRead: false,
                source: data.source || 'Cảnh báo chung'
            });
        });

        return () => { socket.disconnect(); };
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
            localStorage.setItem('local_notifications', JSON.stringify(updated));
            return updated;
        });
        // Gọi API nếu là thông báo thật từ backend (nếu id không phải dạng local generate)
        if (!id.startsWith('new-') && !id.startsWith('appr-') && !id.startsWith('rej-')) {
            try { await ApiService.notifications.markRead(id); } catch (e) {}
        }
    };

    const getTheme = (type: NotificationType) => {
        switch (type) {
            case "danger": return { icon: AlertTriangle, color: '#ef4444', bgColor: '#fee2e2', borderClass: 'border-red-100' };
            case "warning": return { icon: AlertTriangle, color: '#f59e0b', bgColor: '#fef3c7', borderClass: 'border-yellow-100' };
            case "success": return { icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5', borderClass: 'border-green-100' };
            default: return { icon: Info, color: '#3b82f6', bgColor: '#eff6ff', borderClass: 'border-blue-100' };
        }
    };

    return (
        <div className="h-full w-full bg-white rounded-[14px] p-6 shadow-sm flex flex-col" style={borderStyle}>
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
                {/* Nút refresh thủ công cho người dùng sốt ruột */}
                <button onClick={() => { setLoading(true); checkReportStatusChanges(); fetchSystemNotifications(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Làm mới">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <RefreshCw className="h-5 w-5 text-gray-400"/>}
                </button>
            </div>

            <div className="flex-1 min-h-0 relative">
                <ScrollArea className="h-[calc(100vh-220px)] pr-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-400 border border-dashed border-gray-200 rounded-[14px] bg-gray-50">
                            <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Hiện tại không có thông báo nào</p>
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
                                            <div className="shrink-0 rounded-[10px] p-2 w-10 h-10 flex items-center justify-center" style={{ backgroundColor: theme.bgColor }}>
                                                <Icon className="w-5 h-5" style={{ color: theme.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn("font-semibold text-sm truncate pr-2", n.isRead ? "text-gray-600" : "text-gray-900")}>
                                                        {n.title}
                                                    </span>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-[8px]">
                                                        {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{n.message}</p>
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