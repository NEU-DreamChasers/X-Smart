'use client';

import { useState } from 'react';
import { Building2, User, Shield } from 'lucide-react';

export function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>('citizen');

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đăng nhập người dân với email: ${email}`);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đăng nhập quản trị viên với email: ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl text-gray-900 mb-1">
              Nền Tảng Dữ Liệu Đô Thị Mở
            </h1>
            <p className="text-lg text-gray-600">
              Thành phố X - Việt Nam
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('citizen')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl transition-all ${
              activeTab === 'citizen'
                ? 'bg-white shadow-sm text-gray-900'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Người dân</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl transition-all ${
              activeTab === 'admin'
                ? 'bg-white shadow-sm text-gray-900'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Nhà quản lý</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {activeTab === 'citizen' ? (
            <form onSubmit={handleCitizenLogin}>
              <div className="mb-8">
                <h2 className="text-xl text-gray-900 mb-2">
                  Đăng nhập - Người dân
                </h2>
                <p className="text-gray-500">
                  Truy cập thông tin dịch vụ công và dữ liệu đô thị
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="citizen-email" className="block text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    id="citizen-email"
                    type="email"
                    placeholder="nguoidung@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="citizen-password" className="block text-gray-900 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    id="citizen-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl transition-colors"
                >
                  Đăng nhập
                </button>

                <p className="text-center text-gray-400 text-sm">
                  Nhấn đăng nhập để tiếp tục
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="mb-8">
                <h2 className="text-xl text-gray-900 mb-2">
                  Đăng nhập - Nhà quản lý
                </h2>
                <p className="text-gray-500">
                  Quản lý dữ liệu, phân tích và báo cáo hệ thống
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="admin-email" className="block text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@thanhphox.gov.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-gray-900 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl transition-colors"
                >
                  Đăng nhập quản trị
                </button>

                <p className="text-center text-gray-400 text-sm">
                  Nhấn đăng nhập để tiếp tục
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
