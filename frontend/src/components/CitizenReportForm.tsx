'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { createCitizenReport, ReportFormState } from '../services/report.service';
import { MapPin, Send, AlertTriangle, Loader2, X, ImagePlus, Phone, Type } from 'lucide-react';

const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export default function CitizenReportForm() {
  // Sử dụng Interface ReportFormState
  const [formData, setFormData] = useState<ReportFormState>({
    category: 'traffic',
    title: '', // Trường mới bắt buộc
    description: '',
    address: '',
    lat: 0,
    lng: 0,
    imageBase64: null,
    phoneNumber: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    setIsLoggedIn(!!token);
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMsg({ type: 'error', text: 'Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageBase64: null }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({ type: 'error', text: 'Trình duyệt không hỗ trợ định vị' });
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setIsLoading(false);
      },
      (err) => {
        setStatusMsg({ type: 'error', text: `Lỗi GPS: ${err.message}` });
        setIsLoading(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    // Validate Title
    if (!formData.title.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập tiêu đề báo cáo.' });
      setIsLoading(false);
      return;
    }

    // Validate Location
    if ((formData.lat === 0 && formData.lng === 0) && !formData.address.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng cung cấp vị trí (Nhập địa chỉ hoặc dùng GPS).' });
      setIsLoading(false);
      return;
    }

    // Validate Phone (for Guest)
    if (!isLoggedIn && !formData.phoneNumber?.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập Số điện thoại xác minh.' });
      setIsLoading(false);
      return;
    }

    try {
      // Hàm service sẽ tự động map các trường sang tên đúng (lng -> lon, imageBase64 -> image)
      await createCitizenReport(formData);
      
      setStatusMsg({ type: 'success', text: 'Gửi phản ánh thành công! Cảm ơn đóng góp của bạn.' });
      // Reset form
      setFormData({
        category: 'traffic',
        title: '',
        description: '',
        address: '',
        lat: 0,
        lng: 0,
        imageBase64: null,
        phoneNumber: ''
      });
    } catch (err: any) {
      // Hiển thị lỗi chi tiết từ Backend trả về
      const resData = err.response?.data;
      const errorMsg = Array.isArray(resData?.message) 
        ? resData.message.join(', ') // Nối các lỗi lại nếu có nhiều
        : (resData?.message || 'Gửi thất bại. Vui lòng thử lại sau.');
      
      setStatusMsg({ type: 'error', text: `Lỗi: ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div 
          className={`p-4 rounded-[14px] flex items-start gap-3 text-sm font-medium shadow-sm ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
          style={borderStyle}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{statusMsg.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột Trái */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Danh mục phản ánh</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-4 pr-10 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm text-gray-700 appearance-none cursor-pointer"
                style={borderStyle}
              >
                <option value="traffic">🚦 Giao thông</option>
                <option value="weather">⛈️ Thời tiết</option>
                <option value="environment">🗑️ Môi trường</option>
                <option value="infrastructure">🚧 Hạ tầng</option>
              </select>
            </div>
          </div>

          {/* MỚI: Input Tiêu đề */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Tiêu đề <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ví dụ: Ùn tắc tại ngã tư..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm placeholder:text-gray-400"
                style={borderStyle}
              />
              <Type className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Mô tả chi tiết</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả sự cố, tình trạng hiện tại..."
              className="w-full px-4 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm placeholder:text-gray-400 resize-none"
              style={borderStyle}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Số điện thoại liên hệ {!isLoggedIn && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder={isLoggedIn ? "Đã đăng nhập (Tự động lấy)" : "Nhập SĐT để xác minh"}
                disabled={isLoggedIn}
                className={`w-full pl-10 pr-4 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm placeholder:text-gray-400 ${isLoggedIn ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                style={borderStyle}
              />
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Cột Phải */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Vị trí sự cố</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập địa chỉ..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="flex-1 px-4 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm placeholder:text-gray-400"
                style={borderStyle}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLoading}
                className="px-4 py-3 bg-white text-gray-700 rounded-[14px] shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                style={borderStyle}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span className="text-sm font-medium">GPS</span>
              </button>
            </div>
            {formData.lat !== 0 && (
              <div className="flex items-center gap-1.5 p-2 bg-blue-50/50 rounded-[10px] w-fit mt-2" style={{ border: '0.8px solid rgba(59, 130, 246, 0.2)' }}>
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Hình ảnh minh chứng</label>
            {!formData.imageBase64 ? (
              <label 
                className="flex flex-col items-center justify-center w-full h-32 rounded-[14px] cursor-pointer bg-white hover:bg-gray-50 transition-all group shadow-sm"
                style={{ border: '0.8px dashed rgba(0, 0, 0, 0.2)' }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-2 bg-gray-50 rounded-[10px] group-hover:bg-blue-50 transition-colors mb-2">
                    <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Tải ảnh lên</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative w-full h-32 rounded-[14px] overflow-hidden shadow-sm group" style={borderStyle}>
                <img src={formData.imageBase64} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-600 rounded-full hover:text-red-600 hover:bg-white transition-all shadow-sm border border-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gray-900 text-white rounded-[14px] font-medium transition-all shadow-sm flex items-center gap-2 hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Gửi phản ánh</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}