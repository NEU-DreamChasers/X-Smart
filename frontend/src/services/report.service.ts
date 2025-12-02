import { api } from './api.service';

// --- Interface & DTO ---

export interface ReportFormState {
  category: string;
  title: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  imageBase64: string | null;
  phoneNumber?: string;
}

export interface ReportDto {
  title: string;
  description: string;
  address: string;
  lat: number;
  lon: number;
  image?: string;
  guestPhone?: string;
}

// Cấu trúc NGSI-LD Property
export interface NgsiProperty<T> {
  type: 'Property';
  value: T;
  observedAt?: string;
}

// Cấu trúc Report chuẩn NGSI-LD (cho UI Admin)
export interface NgsiReport {
  id: string;
  type: string;
  category?: NgsiProperty<string>;
  description?: NgsiProperty<string>;
  address?: NgsiProperty<string>;
  location?: {
    type: 'GeoProperty';
    value: { type: 'Point'; coordinates: [number, number] };
  };
  status?: NgsiProperty<'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'>; // Đồng bộ chữ hoa/thường ở UI
  media?: NgsiProperty<string>;
  reporter?: NgsiProperty<string>;
  dateObserved?: NgsiProperty<string>;
  [key: string]: any;
}

// --- API Calls ---

export const createCitizenReport = async (formData: ReportFormState) => {
  let finalDescription = `[${formData.title}] ${formData.description}`;
  if (formData.phoneNumber) {
    finalDescription += `\n\n(SĐT: ${formData.phoneNumber})`;
  }

  const payload: ReportDto = {
    title: formData.title,
    description: finalDescription,
    address: formData.address,
    lat: Number(formData.lat),
    lon: Number(formData.lng),
    image: formData.imageBase64 || undefined,
    guestPhone: formData.phoneNumber || undefined,
  };

  const response = await api.post('/reports', payload);
  return response.data;
};

// Hàm map dữ liệu từ Backend sang format NGSI-LD cho UI
const mapToNgsiReport = (item: any): NgsiReport => ({
  id: item.id,
  type: 'Report',
  
  category: { type: 'Property', value: item.category || 'other' },
  
  description: { type: 'Property', value: item.description || item.title || '' },
  
  address: { type: 'Property', value: item.address || 'Chưa cập nhật' },
  
  // Quan trọng: Backend trả về status, map vào value
  status: { type: 'Property', value: item.status || 'PENDING' },
  
  media: { type: 'Property', value: item.image || '' },
  
  dateObserved: { type: 'Property', value: item.createdAt || new Date().toISOString() },
  
  reporter: { type: 'Property', value: item.user?.fullName || item.guestPhone || 'Khách vãng lai' },
  
  location: {
    type: 'GeoProperty',
    value: { 
      type: 'Point', 
      coordinates: [Number(item.lon || item.lng || 0), Number(item.lat || 0)] 
    }
  }
});

// Lấy danh sách Public (người dùng thường)
export const getReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports'); // Endpoint public
    if (Array.isArray(response.data)) {
      return response.data.map(mapToNgsiReport);
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách báo cáo:", error);
    return [];
  }
};

// --- ADMIN API ---

// 1. Lấy TẤT CẢ báo cáo (bao gồm Pending, Rejected...)
export const getAdminReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports/admin/all');
    if (Array.isArray(response.data)) {
      return response.data.map(mapToNgsiReport);
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Admin reports:", error);
    return [];
  }
};

// 2. Duyệt báo cáo
export const approveReport = async (id: string) => {
  return await api.patch(`/reports/${id}/approve`);
};

// 3. Từ chối báo cáo
export const rejectReport = async (id: string) => {
  return await api.patch(`/reports/${id}/reject`);
};

// 4. Đánh dấu đã xử lý xong
export const resolveReport = async (id: string) => {
  return await api.patch(`/reports/${id}/resolve`);
};