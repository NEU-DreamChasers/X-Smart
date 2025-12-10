/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiService } from "@/services/api.service";
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

export function CitizenNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 1. HÀM GỌI API (LẤY LỊCH SỬ) ---
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await ApiService.notifications.getAll();
            const data = response.data;

            // Map dữ liệu từ Backend (Entity) sang Frontend (Interface)
            const mappedNotifications: NotificationItem[] = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                message: item.message,
                type: item.type?.toLowerCase() || 'info',
                timestamp: new Date(item.createdAt),
                isRead: item.isRead,
                source: item.source || 'Hệ thống'
            }));

            setNotifications(mappedNotifications);
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. EFFECT KẾT HỢP API & SOCKET ---
    useEffect(() => {
        // A. Gọi API ngay khi vào trang
        fetchHistory();

        // B. Kết nối Socket để nghe tin mới
        const socket = io('http://localhost:8080', {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('✅ Connected to Alert System');
        });

        // C. Lắng nghe sự kiện 'global_alert'
        socket.on('global_alert', (newAlert: any) => {
            console.log('🔥 Real-time Alert:', newAlert);

            const newNoti: NotificationItem = {
                id: newAlert.id,
                title: newAlert.title,
                message: newAlert.message,
                type: newAlert.type?.toLowerCase() || 'info',
                timestamp: new Date(newAlert.timestamp),
                isRead: false,
                source: newAlert.source
            };

            setNotifications(prev => {
                if (prev.some(n => n.id === newNoti.id)) return prev;
                return [newNoti, ...prev];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // --- 3. HÀM ĐÁNH DẤU ĐÃ ĐỌC ---
    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await ApiService.notifications.markRead(id);
        } catch (e) {
            console.error("Lỗi mark read:", e);
        }
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
                                                        {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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