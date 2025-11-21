'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Shield } from 'lucide-react';
import type { UserRole, User as UserType } from '../app/page';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, user: UserType) => void;
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
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
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', {
      name: 'Quản trị viên',
      email: adminEmail || 'admin@thanhpho.gov.vn',
      role: 'admin',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng nhập tài khoản</DialogTitle>
          <DialogDescription>
            Đăng nhập để lưu cài đặt và nhận thông báo cá nhân hóa
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="citizen" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Người dân
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Quản lý
            </TabsTrigger>
          </TabsList>

          {/* Citizen Login */}
          <TabsContent value="citizen">
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
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}