/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Server, MapPin, X, Loader2, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { ApiService } from '@/services/api.service';

interface Sensor {
  id: string;
  name: string;
  adapterType: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  status?: string;
}

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };
const PAGE_SIZE = 10;

export default function SensorManagement() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    adapterType: 'openweathermap',
    latitude: 0,
    longitude: 0,
  });

  // --- 1. GET: Lấy danh sách ---
  const fetchSensors = async () => {
    setLoading(true);
    try {
      const response = await ApiService.sources.getAll(PAGE_SIZE, offset);
      
      if (response && Array.isArray(response.data)) {
         setSensors(response.data);
         setTotalCount(response.totalCount);
      } else {
         setSensors([]);
         setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi tải cảm biến:", error);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, [offset]);

  const handlePrev = () => {
    if (offset > 0) setOffset(prev => Math.max(0, prev - PAGE_SIZE));
  };

  const handleNext = () => {
    if (offset + PAGE_SIZE < totalCount) setOffset(prev => prev + PAGE_SIZE);
  };

  // --- 2. HANDLERS ---
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', adapterType: 'openweathermap', latitude: 0, longitude: 0 });
    setIsModalOpen(false);
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingId(sensor.id);
    setFormData({
      name: sensor.name,
      adapterType: sensor.adapterType,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await ApiService.sources.update(editingId, formData);
      } else {
        await ApiService.sources.create(formData);
      }
      await fetchSensors();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu dữ liệu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa nguồn dữ liệu này? Hành động không thể hoàn tác.")) return;
    try {
      await ApiService.sources.delete(id);
      fetchSensors();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Không thể xóa nguồn này.");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[14px] shadow-sm" style={borderStyle}>
        <div>
            <h2 className="text-lg font-bold text-gray-900">Quản lý Cảm biến & Nguồn dữ liệu</h2>
            <p className="text-sm text-gray-500">Cấu hình kết nối IoT và API (Weather, Air, GPS...)</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchSensors} 
                className="p-2 bg-gray-50 text-gray-600 rounded-[10px] hover:bg-gray-100 transition-colors border border-gray-200"
                title="Tải lại"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-[10px] hover:bg-neutral-800 transition-colors shadow-sm font-medium text-sm"
            >
                <Plus className="w-4 h-4" /> Thêm nguồn mới
            </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden" style={borderStyle}>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                {/* Đã xóa border-b ở đây */}
                <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                        <th className="px-6 py-4">Tên nguồn</th>
                        <th className="px-6 py-4">Loại Adapter</th>
                        <th className="px-6 py-4">Vị trí (Lat, Lon)</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                </thead>
                {/* Đã xóa divide-y divide-gray-100 ở đây */}
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    <span>Đang tải dữ liệu...</span>
                                </div>
                            </td>
                        </tr>
                    ) : sensors.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chưa có nguồn dữ liệu nào.</td></tr>
                    ) : (
                        sensors.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-neutral-900 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-[8px] text-blue-600 border border-blue-100">
                                        <Server className="w-4 h-4" />
                                    </div>
                                    {s.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                        {s.adapterType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                        s.status === 'inactive' 
                                        ? 'bg-gray-50 text-gray-600 border-gray-200' 
                                        : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'inactive' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                                        {s.status === 'inactive' ? 'Tạm dừng' : 'Hoạt động'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(s)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-[8px] transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(s.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* FOOTER PHÂN TRANG */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
                Hiển thị {sensors.length > 0 ? offset + 1 : 0} - {Math.min(offset + PAGE_SIZE, totalCount)} trên tổng số <b>{totalCount}</b>
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

      {/* Custom Modal/Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[16px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" style={borderStyle}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật nguồn dữ liệu' : 'Thêm nguồn dữ liệu mới'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Nhập thông tin kết nối tới API hoặc tọa độ cảm biến.</p>
                    </div>
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Tên nguồn</label>
                        <input 
                            required
                            type="text" 
                            placeholder="VD: Trạm quan trắc Quận 1"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Loại Adapter</label>
                        <input 
                            required
                            type="text" 
                            placeholder="openweathermap / overpass_parking..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900"
                            value={formData.adapterType}
                            onChange={(e) => setFormData({...formData, adapterType: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Vĩ độ (Lat)</label>
                            <input 
                                required
                                type="number" 
                                step="any"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Kinh độ (Lon)</label>
                            <input 
                                required
                                type="number" 
                                step="any"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-[10px] hover:bg-gray-200 transition-colors text-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-neutral-900 text-white font-medium rounded-[10px] hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}