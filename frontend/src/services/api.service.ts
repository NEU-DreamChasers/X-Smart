import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 1. Thêm Interceptor: Tự động lấy Token từ localStorage gửi kèm request
api.interceptors.request.use((config) => {
  // Lưu ý: Kiểm tra window để tránh lỗi khi render phía server (Next.js)
  if (typeof window !== 'undefined') {
    // Key bạn đang dùng trong SensorManagement là 'access_token'
    const token = localStorage.getItem('access_token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper to parse NGSI-LD response to flat object for UI
const parseNgsi = (item: any) => {
  const result: any = { id: item.id, type: item.type };
  Object.keys(item).forEach(key => {
    if (item[key] && typeof item[key] === 'object' && 'value' in item[key]) {
      result[key] = item[key].value;
    } else {
      result[key] = item[key];
    }
  });
  return result;
};

export const ApiService = {
  // --- MỚI: Quản lý Sources (Cảm biến) ---
  sources: {
    getAll: async () => {
      // Backend trả về mảng DataSource thuần (TypeORM entity), không phải NGSI-LD
      const res = await api.get('/sources');
      return res.data;
    },
    create: (data: any) => api.post('/sources', data),
    update: (id: string, data: any) => api.patch(`/sources/${id}`, data),
    delete: (id: string) => api.delete(`/sources/${id}`),
  },

  // ... (Giữ nguyên các phần Weather, Air, Bus, Parking cũ của bạn)
  weather: {
    getAll: async () => {
      const res = await api.get('/weather/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    create: (id: string, data: any) => api.post(`/weather/status/${id}`, data, { params: { type: 'openweathermap' } }),
    delete: (id: string) => api.delete(`/weather/status/${id}`),
  },
  air: {
    getAll: async () => {
      const res = await api.get('/air/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    create: (id: string, data: any) => api.post(`/air/status/${id}`, data, { params: { type: 'openweathermap_aqi' } }),
    delete: (id: string) => api.delete(`/air/status/${id}`),
  },
  bus: {
    getAll: async () => {
      const res = await api.get('/bus/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    delete: (id: string) => api.delete(`/bus/status/${id}`),
  },
  parking: {
    getAll: async () => {
      const res = await api.get('/parking/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    delete: (id: string) => api.delete(`/parking/status/${id}`),
  },
};