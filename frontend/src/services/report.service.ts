import { api } from './api.service';


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
  imageUrl?: string;
  guestPhone?: string;
}

export interface NgsiProperty<T> {
  type: 'Property';
  value: T;
  observedAt?: string;
}

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
    imageUrl: formData.imageBase64 || undefined,
    guestPhone: formData.phoneNumber || undefined,
  };

  const response = await api.post('/reports', payload);
  return response.data;
};

const mapToNgsiReport = (item: any): NgsiReport => {
  let coordinates: [number, number] = [0, 0];
  
  if (item.location && item.location.coordinates) {
      coordinates = item.location.coordinates; 
  } else if (item.lon && item.lat) {
      coordinates = [Number(item.lon), Number(item.lat)];
  }

  return {
    id: String(item.id),
    type: 'Report',
    
    category: { type: 'Property', value: item.category || 'other' },
    
    description: { type: 'Property', value: item.description || item.title || '' },
    
    address: { type: 'Property', value: item.address || 'Chưa cập nhật' },
    
    status: { type: 'Property', value: item.status || 'PENDING' },
    
    media: { type: 'Property', value: item.imageUrl || item.image || '' },
    
    dateObserved: { type: 'Property', value: item.createdAt || new Date().toISOString() },
    
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

export const getReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports/public');
    if (Array.isArray(response.data)) {
      return response.data.map(mapToNgsiReport);
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách báo cáo:", error);
    return [];
  }
};

export const getAdminReports = async (): Promise<NgsiReport[]> => {
  try {
    const response = await api.get('/reports/admin/all');
    let rawList = [];
    
    if (Array.isArray(response.data)) {
        rawList = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
        rawList = response.data.data; 
    }

    return rawList.map(mapToNgsiReport);

  } catch (error) {
    console.error("Lỗi khi lấy danh sách Admin reports:", error);
    return [];
  }
};

export const approveReport = async (id: string) => {
  return await api.patch(`/reports/${id}/approve`);
};

export const rejectReport = async (id: string) => {
  return await api.patch(`/reports/${id}/reject`);
};

export const resolveReport = async (id: string) => {
  return await api.patch(`/reports/${id}/resolve`);
};

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
