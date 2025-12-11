/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import React, { useState } from 'react';
import { useCitizenData, DataSourceDomain } from '@/hooks/useCitizenData';
import { CitizenEntity } from '@/types/citizen-data';
import { exportToJSON, exportToCSV, generateFilename } from '@/utils/data-export';
import { 
  FileJson, 
  FileSpreadsheet, 
  Info, 
  ExternalLink, 
  Code, 
  Database, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

const getVal = (prop: any, fallback: string | number = '--') => prop?.value ?? fallback;

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: 'json' | 'csv') => void;
  domain: string;
  count: number;
}

const DownloadModal = ({ isOpen, onClose, onConfirm, domain, count }: DownloadModalProps) => {
  if (!isOpen) return null;

  const datasetName = domain === 'weather' ? 'Dữ liệu Thời tiết & Nhiệt độ' : 'Dữ liệu Chất lượng Không khí (AQI)';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Download className="w-5 h-5" /> Tải xuống Dữ liệu Mở
          </h3>
          <button onClick={onClose} className="text-blue-100 hover:text-white hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3">
            <Database className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Bộ dữ liệu đang chọn:</p>
              <p className="text-blue-700 font-bold">{datasetName}</p>
              <p className="text-xs text-blue-600 mt-1">Số lượng bản ghi: {count}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Điều khoản sử dụng (MIT License)
            </h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Bạn được phép sử dụng, phân phối và sửa đổi dữ liệu miễn phí.</li>
              <li>
                Vui lòng trích dẫn nguồn: 
                <span className="font-mono bg-gray-100 px-1 rounded mx-1 text-xs text-black">
                  Nguồn: X-Smart City Platform
                </span> 
                khi công bố.
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3 text-center">Chọn định dạng tải về:</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onConfirm('csv')}
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 group transition-all"
              >
                <FileSpreadsheet className="w-6 h-6 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Excel / CSV</span>
                <span className="text-[10px] text-gray-400">Dành cho phổ thông</span>
              </button>

              <button 
                onClick={() => onConfirm('json')}
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 group transition-all"
              >
                <FileJson className="w-6 h-6 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">NGSI-LD JSON</span>
                <span className="text-[10px] text-gray-400">Dành cho Lập trình viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENT CHÍNH ---
export default function CitizenDataLoader() {
  const [activeDomain, setActiveDomain] = useState<DataSourceDomain>('weather');
  const [isDevMode, setIsDevMode] = useState(false); 
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error } = useCitizenData(activeDomain);

  // Xử lý khi người dùng chọn định dạng trong Modal
  const handleConfirmDownload = (format: 'json' | 'csv') => {
    const filename = generateFilename(activeDomain, format);
    
    if (format === 'json') {
      exportToJSON(data, filename);
    } else {
      exportToCSV(data, filename, activeDomain);
    }
    setShowModal(false);
  };

  const renderTabs = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* 1. Khu vực chọn Bộ dữ liệu */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit shadow-inner">
        {[
          { id: 'weather', label: '🌤️ Thời tiết' },
          { id: 'air', label: '😷 Không khí' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDomain(tab.id as DataSourceDomain)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeDomain === tab.id
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Toggle Chế độ Developer */}
        <div 
          className="flex items-center gap-2 cursor-pointer group select-none"
          onClick={() => setIsDevMode(!isDevMode)}
        >
          <span className={`text-sm font-medium transition-colors ${isDevMode ? 'text-blue-700' : 'text-gray-600'}`}>
            {isDevMode ? 'Chế độ NGSI-LD' : 'Xem dạng thẻ'}
          </span>
          <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${isDevMode ? 'bg-blue-600' : ''}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isDevMode ? 'translate-x-5' : ''}`}></div>
          </div>
        </div>

        {/* Nút Mở Modal Tải xuống - Được thiết kế lại */}
        {!loading && !error && data.length > 0 && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Tải bộ dữ liệu này"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải dữ liệu</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Tra cứu Dữ liệu Mở <span className="text-xs font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full">NGSI-LD Compliant</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Nền tảng chia sẻ dữ liệu đô thị theo chuẩn quốc tế (ETSI ISG CIM & FiWARE).
        </p>
      </div>

      {/* Banner thông báo bản quyền */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-blue-100 rounded-lg">
           <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-sm text-blue-900">
          <p className="font-bold text-base mb-1">Cổng dữ liệu mở (Open Data Portal)</p>
          <p className="leading-relaxed opacity-80 text-gray-700">
            Hệ thống cung cấp API và dữ liệu thô theo chuẩn <strong>NGSI-LD</strong> phục vụ nghiên cứu và phát triển ứng dụng.
            <br/>Dữ liệu được cấp phép theo <strong>MIT License</strong> - Khuyến khích sự sáng tạo của cộng đồng.
          </p>
        </div>
      </div>

      {renderTabs()}

      {/* Modal Tải xuống */}
      <DownloadModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onConfirm={handleConfirmDownload}
        domain={activeDomain}
        count={data.length}
      />

      {loading && (
        <div className="flex flex-col justify-center items-center h-60 gap-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm font-medium">Đang đồng bộ dữ liệu thời gian thực...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <Info className="w-5 h-5" /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Database className="w-12 h-12 text-gray-300 mb-3" />
               <p className="text-gray-500 font-medium">Hiện tại chưa có dữ liệu cảm biến nào.</p>
            </div>
          ) : (
            data.map((item) => (
              isDevMode 
                ? <JsonLdCard key={item.id} item={item} /> 
                : <EntityCard key={item.id} item={item} domain={activeDomain} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS (Card hiển thị) ---

const EntityCard = ({ item, domain }: { item: CitizenEntity; domain: DataSourceDomain }) => {
  const displayName = item.name?.value || item.id.split(':').pop();
  const updatedTime = formatTime(item.dateObserved?.value || item.modifiedAt);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-5 flex flex-col justify-between h-full group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 truncate pr-2 group-hover:text-blue-700 transition-colors" title={displayName as string}>
            {displayName}
          </h3>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full flex items-center gap-1">
             <CheckCircle2 className="w-3 h-3 text-green-500" />
            {updatedTime}
          </span>
        </div>

        <div className="space-y-4 mt-4">
          {domain === 'weather' && (
            <>
              <div className="flex items-end justify-between">
                <span className="text-gray-500 text-sm mb-1">Nhiệt độ</span>
                <span className="text-3xl font-bold text-gray-800">{getVal(item.temperature)}<span className="text-lg text-orange-500 align-top">°C</span></span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                   <p className="text-xs text-blue-400 uppercase font-bold">Độ ẩm</p>
                   <p className="text-sm font-semibold text-blue-700">{getVal(item.relativeHumidity)}%</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                   <p className="text-xs text-gray-400 uppercase font-bold">Thời tiết</p>
                   <p className="text-sm font-semibold text-gray-700 capitalize truncate">{getVal(item.weatherType)}</p>
                </div>
              </div>
            </>
          )}

          {domain === 'air' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Chỉ số AQI</span>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${Number(getVal(item.airQualityIndex)) > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  AQI {getVal(item.airQualityIndex)}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Bụi PM2.5</span>
                   <span className="font-medium">{getVal(item.pm25)} µg/m³</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                   <div className="bg-green-500 h-1.5 rounded-full w-1/3"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-5 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Vị trí cảm biến</span>
        <span className="font-mono bg-gray-50 px-1 rounded">ID: {item.id.split(':').pop()?.slice(0,8)}...</span>
      </div>
    </div>
  );
};

const JsonLdCard = ({ item }: { item: CitizenEntity }) => {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg flex flex-col h-[320px] overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all">
      <div className="bg-[#0f172a] px-4 py-3 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2 overflow-hidden">
           <Code className="w-4 h-4 text-blue-400 shrink-0" />
           <span className="text-xs font-mono text-slate-300 truncate" title={item.id}>
             {item.id}
           </span>
        </div>
        <div className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase">
           NGSI-LD
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap break-all">
          {JSON.stringify(item, null, 2)}
        </pre>
      </div>
    </div>
  );
};