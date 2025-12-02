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
  status?: NgsiProperty<'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'>;
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

// --- HÀM MAP QUAN TRỌNG ĐÃ ĐƯỢC SỬA ---
const mapToNgsiReport = (item: any): NgsiReport => {
  // 1. Xử lý tọa độ: Ưu tiên lấy từ PostGIS location trả về từ backend
  let coordinates: [number, number] = [0, 0];
  
  if (item.location && item.location.coordinates) {
      // Backend PostGIS trả về: { type: 'Point', coordinates: [lng, lat] }
      coordinates = item.location.coordinates; 
  } else if (item.lon && item.lat) {
      // Fallback nếu backend trả về lat/lon rời
      coordinates = [Number(item.lon), Number(item.lat)];
  }

  return {
    id: String(item.id),
    type: 'Report',
    
    category: { type: 'Property', value: item.category || 'other' },
    
    description: { type: 'Property', value: item.description || item.title || '' },
    
    address: { type: 'Property', value: item.address || 'Chưa cập nhật' },
    
    status: { type: 'Property', value: item.status || 'PENDING' },
    
    // Backend trả về imageUrl, ta map vào media.value
    media: { type: 'Property', value: item.imageUrl || item.image || '' },
    
    dateObserved: { type: 'Property', value: item.createdAt || new Date().toISOString() },
    
    // Lấy tên người gửi hoặc khách vãng lai
    reporter: { type: 'Property', value: item.user?.fullName || item.guestName || 'Khách vãng lai' },
    
    location: {
      type: 'GeoProperty',
      value: { 
        type: 'Point', 
        coordinates: coordinates
      }
    }
  };
};

// Lấy danh sách Public (người dùng thường)
export const getReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports/public');
    // API public thường trả về mảng trực tiếp
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
    
    // --- SỬA LOGIC Ở ĐÂY ---
    // Backend trả về { data: [], meta: {} }, cần lấy thuộc tính .data
    let rawList = [];
    
    if (Array.isArray(response.data)) {
        // Trường hợp backend trả về mảng trực tiếp
        rawList = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
        // Trường hợp backend trả về object phân trang (như code hiện tại của bạn)
        rawList = response.data.data; 
    }

    return rawList.map(mapToNgsiReport);

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

// --- MỚI THÊM: Lấy lịch sử báo cáo cá nhân ---
export const getMyReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports/my-reports');
    if (Array.isArray(response.data)) {
      return response.data.map(mapToNgsiReport);
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử báo cáo cá nhân:", error);
    return [];
  }
};

export const getReportById = async (id: string): Promise<NgsiReport | null> => {
  try {
    const response = await api.get(`/reports/${id}`);
    if (response.data) {
      return mapToNgsiReport(response.data);
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết báo cáo:", error);
    return null;
  }
};