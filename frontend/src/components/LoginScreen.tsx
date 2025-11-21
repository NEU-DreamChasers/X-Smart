'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Building2, User, Shield } from 'lucide-react';
import type { UserRole, User as UserType } from '../app/page';

interface LoginScreenProps {
  onLogin: (role: UserRole, user: UserType) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('citizen', {
      name: 'Nguyễn Văn A',
      email: citizenEmail || 'nguoidung@example.com',
      role: 'citizen',
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', {
      name: 'Quản trị viên',
      email: adminEmail || 'admin@thanhpho.gov.vn',
      role: 'admin',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-blue-900">Nền Tảng Dữ Liệu Đô Thị Mở</h1>
              <p className="text-gray-600">Thành phố X - Việt Nam</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hệ thống tích hợp dữ liệu IoT theo tiêu chuẩn NGSI-LD và SOSA/SSN
          </p>
        </div>

        {/* Login Tabs */}
        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="citizen" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Người dân
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Nhà quản lý
            </TabsTrigger>
          </TabsList>

          {/* Citizen Login */}
          <TabsContent value="citizen">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Đăng nhập - Người dân</CardTitle>
                <CardDescription>
                  Truy cập thông tin dịch vụ công và dữ liệu đô thị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCitizenLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizen-email">Email</Label>
                    <Input
                      id="citizen-email"
                      type="email"
                      placeholder="nguoidung@example.com"
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-password">Mật khẩu</Label>
                    <Input
                      id="citizen-password"
                      type="password"
                      placeholder="••••••••"
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Đăng nhập
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Demo: Nhấn đăng nhập để tiếp tục
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Đăng nhập - Nhà quản lý</CardTitle>
                <CardDescription>
                  Quản lý và phân tích dữ liệu đô thị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@thanhpho.gov.vn"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Mật khẩu</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Đăng nhập
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Demo: Nhấn đăng nhập để tiếp tục
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-center mb-2 text-gray-900">Tiêu chuẩn NGSI-LD</h3>
              <p className="text-sm text-gray-600 text-center">
                API và mô hình dữ liệu theo chuẩn ETSI ISG CIM
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-center mb-2 text-gray-900">SOSA/SSN Ontology</h3>
              <p className="text-sm text-gray-600 text-center">
                Mô hình hóa dữ liệu cảm biến IoT theo W3C
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-center mb-2 text-gray-900">FIWARE Models</h3>
              <p className="text-sm text-gray-600 text-center">
                Kế thừa Smart Data Models chuẩn quốc tế
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}