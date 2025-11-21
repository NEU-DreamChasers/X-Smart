'use client';

import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'services' | 'environment' | 'notifications'>('map');

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.1)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-[#155dfc] rounded-[10px] p-2 size-12 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] text-neutral-950">Thành phố X</h1>
              <p className="text-[12px] text-[#4a5565]">Nền tảng dữ liệu mở</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[14px] text-neutral-950">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.281 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.281 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Nguyễn Văn A</span>
            </div>
            <button className="flex items-center gap-2 text-[14px] text-neutral-950 hover:text-[#155dfc] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 8H6" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="bg-[#ececf0] rounded-[14px] p-[3px] flex gap-0 mb-6">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-[8px] rounded-[14px] transition-colors ${
              activeTab === 'map' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9.404 3.702C9.58907 3.79448 9.79312 3.84262 10 3.84262C10.2069 3.84262 10.4109 3.79448 10.596 3.702L13.0353 2.482C13.1371 2.43117 13.2501 2.40721 13.3637 2.41238C13.4773 2.41755 13.5876 2.45169 13.6843 2.51155C13.781 2.57142 13.8607 2.65501 13.916 2.75439C13.9713 2.85377 14.0002 2.96563 14 3.07933V11.5887C13.9999 11.7124 13.9654 11.8338 13.9003 11.939C13.8352 12.0443 13.7421 12.1293 13.6313 12.1847L10.596 13.7027C10.4109 13.7951 10.2069 13.8433 10 13.8433C9.79312 13.8433 9.58907 13.7951 9.404 13.7027L6.596 12.2987C6.41094 12.2062 6.20689 12.158 6 12.158C5.79312 12.158 5.58907 12.2062 5.404 12.2987L2.96467 13.5187C2.8629 13.5695 2.74982 13.5935 2.63617 13.5883C2.52253 13.5831 2.41211 13.5489 2.31541 13.4889C2.21872 13.429 2.13898 13.3453 2.08377 13.2458C2.02856 13.1464 1.99972 13.0344 2 12.9207V4.412C2.00007 4.28823 2.03459 4.16691 2.0997 4.06165C2.16482 3.95639 2.25795 3.87133 2.36867 3.816L5.404 2.298C5.58907 2.20552 5.79312 2.15738 6 2.15738C6.20689 2.15738 6.41094 2.20552 6.596 2.298L9.404 3.702Z" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 3.84267V13.8427" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2.15733V12.1573" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] text-neutral-950">Bản đồ</span>
          </button>
          
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-[8px] rounded-[14px] transition-colors ${
              activeTab === 'services' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5.33333 4V8" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 4V8" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.33333 8H14.4" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] text-neutral-950">Dịch vụ</span>
          </button>
          
          <button
            onClick={() => setActiveTab('environment')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-[8px] rounded-[14px] transition-colors ${
              activeTab === 'environment' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.33332 13.3333C6.16269 13.3369 5.03349 12.9003 4.16966 12.1103C3.30584 11.3202 2.7705 10.2344 2.66981 9.06807C2.56912 7.90178 2.91045 6.74024 3.62609 5.81383C4.34173 4.88742 5.37941 4.2638 6.53332 4.06667C10.3333 3.33333 11.3333 2.98667 12.6667 1.33333C13.3333 2.66667 14 4.12 14 6.66667C14 10.3333 10.8133 13.3333 7.33332 13.3333Z" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.33333 14C1.33333 12 2.56667 10.4267 4.72 10C6.33333 9.68 8 8.66667 8.66667 8" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] text-neutral-950">Môi trường</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-[8px] rounded-[14px] transition-colors ${
              activeTab === 'notifications' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.17467 10.2173C2.08758 10.3128 2.0301 10.4315 2.00924 10.559C1.98837 10.6865 2.00501 10.8174 2.05714 10.9356C2.10926 11.0538 2.19462 11.1544 2.30284 11.225C2.41105 11.2956 2.53745 11.3332 2.66667 11.3333H13.3333C13.4625 11.3334 13.589 11.2959 13.6972 11.2254C13.8055 11.1549 13.891 11.0545 13.9433 10.9363C13.9955 10.8182 14.0123 10.6874 13.9916 10.5599C13.9709 10.4323 13.9136 10.3136 13.8267 10.218C12.94 9.304 12 8.33267 12 5.33333C12 4.27247 11.5786 3.25505 10.8284 2.50491C10.0783 1.75476 9.06087 1.33333 8 1.33333C6.93914 1.33333 5.92172 1.75476 5.17157 2.50491C4.42143 3.25505 4 4.27247 4 5.33333C4 8.33267 3.05933 9.304 2.17467 10.2173Z" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.84534 14C6.96237 14.2027 7.13068 14.371 7.33337 14.488C7.53605 14.605 7.76597 14.6666 8 14.6666C8.23404 14.6666 8.46396 14.605 8.66664 14.488C8.86933 14.371 9.03764 14.2027 9.15467 14" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] text-neutral-950">Thông báo</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'services' && <ServicesView />}
        {activeTab === 'environment' && <EnvironmentView />}
        {activeTab === 'notifications' && <NotificationsView />}
      </div>
    </div>
  );
}

// Map View Component
function MapView() {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282]" fill="none" viewBox="0 0 16 16">
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L11.1067 11.1067" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm, dịch vụ..."
              className="w-full bg-[#f5f6f8] rounded-[8px] pl-10 pr-4 py-2 text-[14px] outline-none border-none"
            />
          </div>
          <button className="bg-black text-white rounded-[8px] px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#1a1a1a]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 7.33333L14.6667 1.33333L8.66667 14L7.33333 8.66667L2 7.33333Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Vị trí hiện tại
          </button>
        </div>
      </div>

      {/* Map and Places */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Map */}
        <div className="bg-white rounded-[14px] p-6">
          <h2 className="text-[16px] text-neutral-950 mb-4">Bản đồ thành phố</h2>
          
          {/* Map Container */}
          <div className="relative bg-gradient-to-br from-[#d4eff9] to-[#b8e6f5] rounded-[10px] h-[500px] overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400/30" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-400/30" />
            </div>

            {/* Markers */}
            <div className="absolute left-[25%] top-[30%] flex flex-col items-center">
              <div className="bg-[#dbeafe] border-2 border-white rounded-full p-2 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#155dfc" strokeWidth="2"/>
                </svg>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded-[6px] text-[12px] shadow-sm">0.3 km</div>
            </div>

            <div className="absolute left-[55%] top-[35%] flex flex-col items-center">
              <div className="bg-[#ffe2e2] border-2 border-white rounded-full p-2 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V10M10 14H10.01" stroke="#e7000b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded-[6px] text-[12px] shadow-sm">0.8 km</div>
            </div>

            <div className="absolute left-[20%] top-[60%] flex flex-col items-center">
              <div className="bg-[#d4f7e1] border-2 border-white rounded-full p-2 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="4" width="12" height="12" stroke="#00a63e" strokeWidth="2" rx="2"/>
                </svg>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded-[6px] text-[12px] shadow-sm">1.2 km</div>
            </div>

            <div className="absolute left-[45%] top-[40%] flex flex-col items-center">
              <div className="bg-purple-100 border-2 border-white rounded-full p-2 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="3" stroke="#9810fa" strokeWidth="2"/>
                  <path d="M10 5V8M10 12V15" stroke="#9810fa" strokeWidth="2"/>
                </svg>
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded-[6px] text-[12px] shadow-sm">0.5 km</div>
            </div>

            {/* Current Location */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="bg-[#155dfc] rounded-full w-3 h-3" />
                <div className="absolute -inset-2 bg-[#51a2ff] rounded-full opacity-30 animate-ping" />
              </div>
            </div>

            {/* Alerts */}
            <div className="absolute bottom-4 left-4 space-y-2 max-w-xs">
              <div className="bg-white rounded-[10px] p-3 shadow-md flex items-start gap-2">
                <span className="text-[16px]">⚠️</span>
                <div>
                  <p className="text-[12px] text-neutral-950">Kẹt xe ở đường Lê Duẩn, hướng Bắc</p>
                  <p className="text-[11px] text-[#6a7282]">10 phút trước</p>
                </div>
              </div>
              <div className="bg-white rounded-[10px] p-3 shadow-md flex items-start gap-2">
                <span className="text-[16px]">✓</span>
                <div>
                  <p className="text-[12px] text-neutral-950">Chất lượng không khí tốt hôm nay</p>
                  <p className="text-[11px] text-[#6a7282]">1 giờ trước</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-[10px] p-3 shadow-md">
              <p className="text-[12px] text-neutral-950 mb-2">Chú giải:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-3 h-3 rounded-full bg-[#155dfc]" />
                  <span className="text-[#6a7282]">Giao thông</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-3 h-3 rounded-full bg-[#e7000b]" />
                  <span className="text-[#6a7282]">Y tế</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-3 h-3 rounded-full bg-[#00a63e]" />
                  <span className="text-[#6a7282]">Giáo dục</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-3 h-3 rounded-full bg-[#9810fa]" />
                  <span className="text-[#6a7282]">Cảm biến IoT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Places */}
        <div className="bg-white rounded-[14px] p-6">
          <h3 className="text-[16px] text-neutral-950 mb-4">Địa điểm gần bạn</h3>
          <div className="space-y-3">
            <PlaceItem icon="🚌" name="Bến xe Bến Thành" distance="0.3 km" color="#155dfc" />
            <PlaceItem icon="🏥" name="Bệnh viện Chợ Rẫy" distance="0.8 km" color="#e7000b" />
            <PlaceItem icon="🏫" name="THPT Lê Hồng Phong" distance="1.2 km" color="#00a63e" />
            <PlaceItem icon="📡" name="Cảm biến CL Không khí Q1" distance="0.5 km" color="#9810fa" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceItem({ icon, name, distance, color }: { icon: string; name: string; distance: string; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[10px] border border-[rgba(0,0,0,0.06)] hover:bg-[#f9fafb] cursor-pointer">
      <div className="flex-shrink-0 size-10 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <span className="text-[18px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-neutral-950 truncate">{name}</p>
        <div className="flex items-center gap-1 text-[11px] text-[#6a7282]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="0.8"/>
          </svg>
          {distance}
        </div>
      </div>
    </div>
  );
}

// Services View Component
function ServicesView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ServiceCard
        title="Giao thông công cộng"
        icon="🚌"
        iconBg="#dbeafe"
        items={[
          { name: 'Lịch trình xe buýt', time: '5 phút trước', status: 'Hoạt động' },
          { name: 'Thông tin tuyến đường', time: '10 phút trước', status: 'Hoạt động' },
          { name: 'Tra cứu giá vé', time: '1 giờ trước', status: 'Hoạt động' },
        ]}
      />
      <ServiceCard
        title="Bãi đỗ xe"
        icon="🅿️"
        iconBg="#d4f7e1"
        items={[
          { name: 'Chỗ trống Quận 1', time: 'Thời gian thực', status: '234 chỗ' },
          { name: 'Chỗ trống Quận 2', time: 'Thời gian thực', status: '156 chỗ' },
          { name: 'Đài chở trước', time: '2 phút trước', status: 'Hoạt động' },
        ]}
      />
      <ServiceCard
        title="Điện & Nước"
        icon="⚡"
        iconBg="#fff9e6"
        items={[
          { name: 'Tra cứu hóa đơn điện', time: '1 ngày trước', status: 'Hoạt động' },
          { name: 'Tra cứu hóa đơn nước', time: '1 ngày trước', status: 'Hoạt động' },
          { name: 'Thanh toán online', time: '30 phút trước', status: 'Hoạt động' },
        ]}
      />
      <ServiceCard
        title="Đèn đường thông minh"
        icon="💡"
        iconBg="#f3e8ff"
        items={[
          { name: 'Báo cáo đèn hỏng', time: '15 phút trước', status: 'Hoạt động' },
          { name: 'Trạng thái đèn chữa', time: '20 phút trước', status: '12 đang xử lý' },
          { name: 'Lịch sử bảo trì', time: '2 giờ trước', status: 'Hoạt động' },
        ]}
      />
    </div>
  );
}

function ServiceCard({ title, icon, iconBg, items }: { title: string; icon: string; iconBg: string; items: Array<{ name: string; time: string; status: string }> }) {
  return (
    <div className="bg-white rounded-[14px] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-[8px] flex items-center justify-center text-[20px]" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <h3 className="text-[15px] text-neutral-950">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-[8px] border border-[rgba(0,0,0,0.06)]">
            <div>
              <p className="text-[13px] text-neutral-950">{item.name}</p>
              <p className="text-[11px] text-[#6a7282]">{item.time}</p>
            </div>
            <div className="px-2 py-1 bg-[#f5f6f8] rounded-[6px] text-[11px] text-neutral-950">{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Environment View Component  
function EnvironmentView() {
  const data = [
    { name: 'Chất lượng không khí', value: '45 AQI', status: 'Tốt', icon: '🌱', color: '#00a63e', bg: '#d4f7e1' },
    { name: 'Nhiệt độ', value: '28°C', status: 'Bình thường', icon: '🌡️', color: '#f54900', bg: '#ffedd4' },
    { name: 'Độ ẩm', value: '68%', status: 'Cao', icon: '💧', color: '#0092b8', bg: '#cefafe' },
    { name: 'Chỉ số UV', value: '8', status: 'Cao', icon: '☀️', color: '#d08700', bg: '#fef9c2' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, i) => (
        <div key={i} className="bg-white rounded-[14px] p-6">
          <div className="size-9 rounded-[8px] flex items-center justify-center mb-3 text-[20px]" style={{ backgroundColor: item.bg }}>
            {item.icon}
          </div>
          <p className="text-[13px] text-[#6a7282] mb-1">{item.name}</p>
          <p className="text-[18px] mb-2" style={{ color: item.color }}>{item.value}</p>
          <div className="inline-block px-2 py-1 rounded-[6px] border border-[rgba(0,0,0,0.1)] text-[11px] text-neutral-950">
            {item.status}
          </div>
        </div>
      ))}
    </div>
  );
}

// Notifications View Component
function NotificationsView() {
  return (
    <div className="bg-white rounded-[14px] p-6">
      <h2 className="text-[16px] text-neutral-950 mb-4">Thông báo</h2>
      <div className="space-y-3">
        <NotificationItem
          title="Cảnh báo chất lượng không khí"
          message="Chỉ số AQI dự kiến tăng lên 85 vào chiều nay"
          time="2 giờ trước"
          unread
        />
        <NotificationItem
          title="Báo cáo đã được xử lý"
          message="Báo cáo #RX02 về thoát nước đã hoàn thành"
          time="5 giờ trước"
        />
        <NotificationItem
          title="Cập nhật lịch xe buýt"
          message="Tuyến 12 thay đổi lộ trình từ 20/11"
          time="1 ngày trước"
        />
      </div>
    </div>
  );
}

function NotificationItem({ title, message, time, unread }: { title: string; message: string; time: string; unread?: boolean }) {
  return (
    <div className={`p-4 rounded-[10px] border ${unread ? 'border-[#155dfc] bg-[#f0f7ff]' : 'border-[rgba(0,0,0,0.06)]'}`}>
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-[13px] text-neutral-950 flex items-center gap-2">
          {title}
          {unread && <span className="size-2 bg-[#155dfc] rounded-full" />}
        </h4>
        <span className="text-[11px] text-[#6a7282] whitespace-nowrap">{time}</span>
      </div>
      <p className="text-[12px] text-[#6a7282]">{message}</p>
    </div>
  );
}