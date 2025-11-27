'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createCitizenReport, ReportPayload } from '../services/report.service';
import { MapPin, Send, AlertTriangle, Loader2, X, ImagePlus } from 'lucide-react';

// Define the exact border style from CitizenMapView
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export default function CitizenReportForm() {
  const [formData, setFormData] = useState<ReportPayload>({
    category: 'traffic',
    description: '',
    address: '',
    lat: 0,
    lng: 0,
    imageBase64: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
          lng: pos.coords.longitude
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

    if (formData.lat === 0 && formData.lng === 0) {
      setStatusMsg({ type: 'error', text: 'Vui lòng cung cấp vị trí (Nhập địa chỉ hoặc dùng GPS).' });
      setIsLoading(false);
      return;
    }

    try {
      await createCitizenReport(formData);
      setStatusMsg({ type: 'success', text: 'Gửi phản ánh thành công!' });
      setFormData({ category: 'traffic', description: '', address: '', lat: 0, lng: 0, imageBase64: null });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Gửi thất bại. Vui lòng thử lại sau.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div 
          className={`p-4 rounded-[14px] flex items-start gap-3 text-sm font-medium shadow-sm ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
          }`}
          style={borderStyle}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{statusMsg.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Danh mục phản ánh</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full pl-4 pr-10 py-3 bg-white rounded-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm text-gray-700 appearance-none cursor-pointer"
                style={borderStyle}
              >
                <option value="traffic">🚦 Giao thông</option>
                <option value="weather">⛈️ Thời tiết</option>
                <option value="environment">🗑️ Môi trường</option>
                <option value="infrastructure">🚧 Hạ tầng</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
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
        </div>

        {/* Right Column */}
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
              <div className="flex items-center gap-1.5 p-2 bg-blue-50/50 rounded-[10px] w-fit" style={{ border: '0.8px solid rgba(59, 130, 246, 0.2)' }}>
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Hình ảnh</label>
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