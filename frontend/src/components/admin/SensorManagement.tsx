'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Loader2, 
  RefreshCcw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Hoặc đường dẫn tới hook toast của bạn

// Interface khớp với Entity DataSource trong Backend [cite: 383]
interface Sensor {
  id: string;
  name: string;
  adapterType: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function SensorManagement() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    adapterType: 'openweathermap',
    latitude: 0,
    longitude: 0,
  });

  // Helper: Lấy token (tùy chỉnh theo cách bạn lưu token)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token'); // Hoặc 'token' tùy key bạn lưu
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // --- 1. GET: Lấy danh sách ---
  const fetchSensors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sources`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSensors(data);
      }
    } catch (error) {
      console.error("Lỗi tải cảm biến:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  // --- 2. POST/PATCH: Thêm hoặc Sửa ---
  const handleSubmit = async () => {
    try {
      const url = editingId 
        ? `${API_URL}/sources/${editingId}` 
        : `${API_URL}/sources`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Thao tác thất bại');

      setOpen(false);
      resetForm();
      fetchSensors(); // Refresh lại bảng
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu dữ liệu!");
    }
  };

  // --- 3. DELETE: Xóa ---
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa nguồn này?")) return;
    try {
      await fetch(`${API_URL}/sources/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchSensors();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', adapterType: 'openweathermap', latitude: 0, longitude: 0 });
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingId(sensor.id);
    setFormData({
      name: sensor.name,
      adapterType: sensor.adapterType,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
    });
    setOpen(true);
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý Cảm biến & Nguồn dữ liệu</CardTitle>
          <CardDescription>
            Cấu hình các nguồn thu thập dữ liệu (Weather, Air, POI...)
          </CardDescription>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSensors}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Tải lại
            </Button>
            <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Thêm mới</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{editingId ? 'Cập nhật nguồn' : 'Thêm nguồn dữ liệu'}</DialogTitle>
                <DialogDescription>Nhập thông tin kết nối tới API hoặc tọa độ cảm biến.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tên</Label>
                    <Input className="col-span-3" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Loại</Label>
                    <Input className="col-span-3" placeholder="openweathermap / overpass_..." value={formData.adapterType} onChange={(e) => setFormData({...formData, adapterType: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Vĩ độ</Label>
                    <Input type="number" className="col-span-3" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Kinh độ</Label>
                    <Input type="number" className="col-span-3" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
                </div>
                <DialogFooter>
                <Button onClick={handleSubmit}>{editingId ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Tên nguồn</TableHead>
                <TableHead>Loại Adapter</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sensors.map((s) => (
                <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.adapterType}</TableCell>
                    <TableCell>{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</TableCell>
                    <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}