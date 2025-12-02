'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Shield, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Lấy URL API từ biến môi trường hoặc dùng mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function SimpleLogin() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>('citizen');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // State để lưu thông báo lỗi

  // Xử lý Login Google cho người dân
  const handleCitizenLogin = () => {
    setIsLoading(true);
    // Chuyển hướng trình duyệt sang Backend để bắt đầu quy trình Google OAuth
    // Backend sẽ tự động redirect sang Google, sau đó trả về Frontend kèm Token
    window.location.href = `${API_URL}/auth/google`;
  };

  // Xử lý Login Admin (Username/Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Reset lỗi cũ

    try {
      // Gọi API Login của NestJS
      // Lưu ý: LocalStrategy mặc định của Passport thường mong đợi field là "username" và "password"
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email, // Mapping email input vào username
        password: password
      });

      // Giả sử Backend trả về: { access_token: "...", user: { ... } }
      const { access_token, user } = response.data;

      // Lưu Token vào LocalStorage để dùng cho các request sau này
      if (access_token) {
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Chuyển hướng vào trang Admin
        router.push('/admin');
      } else {
        setError('Không nhận được token xác thực.');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      // Xử lý hiển thị lỗi từ Backend (nếu có message) hoặc lỗi chung
      if (err.response && err.response.status === 401) {
        setError('Sai tên đăng nhập hoặc mật khẩu.');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
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
            type="button"
            onClick={() => { setActiveTab('citizen'); setError(''); }}
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
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
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
          
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'citizen' ? (
            // Form Người dân: Chỉ có nút Google
            <div className="text-center py-6">
                <h2 className="text-xl text-gray-900 mb-6">Đăng nhập Người dân</h2>
                <button
                  onClick={handleCitizenLogin}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 rounded-xl transition-colors flex items-center justify-center gap-3 relative"
                >
                   {/* Google Icon SVG */}
                   <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C.79 9.81 0 12 0 12s.79 4.19 2.18 6.95l3.66-2.84z" /><path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.61l3.16-3.16C17.45 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 5.23l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                   {isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập bằng Google'}
                </button>
            </div>
          ) : (
            // Form Admin
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
                    Tên đăng nhập / Email
                  </label>
                  <input
                    id="admin-email"
                    type="text" 
                    placeholder="admin"
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
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                   {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập quản trị'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}