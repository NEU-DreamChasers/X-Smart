import axios from 'axios';
import { create } from 'domain';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// THÊM: export const api để report.service.ts có thể dùng chung
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 1. Interceptor: Tự động gắn Token vào Header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      // Backend của bạn dùng Bearer Token
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor: Xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Detail:', JSON.stringify(error.response?.data, null, 2));
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
        console.error('Validation Error:', message[0]);
    }
    return Promise.reject(error);
  }
);

// Helper: Chuyển đổi dữ liệu NGSI-LD sang Object phẳng cho UI
const parseNgsi = (item: any) => {
  if (!item) return null;
  const result: any = { id: item.id, type: item.type };
  Object.keys(item).forEach((key) => {
    if (key !== 'id' && key !== 'type') {
      if (item[key] && typeof item[key] === 'object' && 'value' in item[key]) {
        result[key] = item[key].value;
      } else {
        result[key] = item[key];
      }
    }
  });
  return result;
};

const createNgsiGetAll = (domain: string) => 
  async (limit?: number, offset?: number): Promise<{ data: any[]; totalCount: number }> => {
    const url = `/${domain}/status`;
    const params: any = {};

    if (limit !== undefined) {
      params.limit = limit;
      params.count = 'true';
    }
    if (offset !== undefined) {
      params.offset = offset;
    }

    const res = await api.get(url, { params });
    
    const totalCount = parseInt(res.headers['ngsild-results-count'] || res.headers['x-total-count'] || '0', 10);
    
    return {
        data: Array.isArray(res.data) ? res.data.map(parseNgsi) : [],
        totalCount: totalCount,
    };
  };

export const ApiService = {
  // --- QUẢN LÝ SOURCES (Cảm biến / Nguồn dữ liệu) ---
  sources: {
    getAll: async (limit?: number, offset?: number): Promise<{ data: any[]; totalCount: number }> => {
      const params: any = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;
      
      const res = await api.get('/sources', { params });
      
      const totalCount = parseInt(res.headers['x-total-count'] || '0', 10);
      
      return {
          data: res.data, 
          totalCount: totalCount,
      };
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

  // --- DỮ LIỆU NGSI-LD ---
  weather: {
    getAll: createNgsiGetAll('weather'),
    create: (id: string, data: any) =>
      api.post(`/weather/status/${id}`, data, { params: { type: 'openweathermap' } }),
    delete: (id: string) => api.delete(`/weather/status/${id}`),
  },

  air: {
    getAll: createNgsiGetAll('air'),
    create: (id: string, data: any) =>
      api.post(`/air/status/${id}`, data, { params: { type: 'openweathermap_aqi' } }),
    delete: (id: string) => api.delete(`/air/status/${id}`),
  },

  bus: {
    getAll: createNgsiGetAll('bus'),
    delete: (id: string) => api.delete(`/bus/status/${id}`),
  },

  parking: {
    getAll: createNgsiGetAll('parking'),
    delete: (id: string) => api.delete(`/parking/status/${id}`),
  },
};