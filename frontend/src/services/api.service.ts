import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 1. Interceptor: Tự động gắn Token vào Header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor: Xử lý lỗi chung (Optional - Log lỗi gọn gàng)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper: Chuyển đổi dữ liệu NGSI-LD sang Object phẳng cho UI
const parseNgsi = (item: any) => {
  if (!item) return null;
  const result: any = { id: item.id, type: item.type };
  Object.keys(item).forEach((key) => {
    if (key !== 'id' && key !== 'type') {
      // Nếu là object có value (NGSI-LD Property), lấy value
      if (item[key] && typeof item[key] === 'object' && 'value' in item[key]) {
        result[key] = item[key].value;
      } else {
        // Nếu không, giữ nguyên
        result[key] = item[key];
      }
    }
  });
  return result;
};

export const ApiService = {
  // --- QUẢN LÝ SOURCES (Cảm biến / Nguồn dữ liệu) ---
  sources: {
    getAll: async () => {
      const res = await api.get('/sources');
      return res.data; // Trả về mảng DataSource[]
    },
    getOne: async (id: string) => {
      const res = await api.get(`/sources/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await api.post('/sources', data);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await api.patch(`/sources/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await api.delete(`/sources/${id}`);
      return res.data;
    },
  },

  // --- DỮ LIỆU NGSI-LD (Weather, Air, Bus, Parking) ---
  weather: {
    getAll: async () => {
      const res = await api.get('/weather/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    // Admin nhập liệu thủ công (nếu cần)
    create: (id: string, data: any) =>
      api.post(`/weather/status/${id}`, data, { params: { type: 'openweathermap' } }),
    delete: (id: string) => api.delete(`/weather/status/${id}`),
  },

  air: {
    getAll: async () => {
      const res = await api.get('/air/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    create: (id: string, data: any) =>
      api.post(`/air/status/${id}`, data, { params: { type: 'openweathermap_aqi' } }),
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