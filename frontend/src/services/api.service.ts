import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
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
  // Weather
  weather: {
    getAll: async () => {
      const res = await api.get('/weather/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    create: (id: string, data: any) => api.post(`/weather/status/${id}`, data, { params: { type: 'openweathermap' } }),
    delete: (id: string) => api.delete(`/weather/status/${id}`),
  },
  // Air Quality
  air: {
    getAll: async () => {
      const res = await api.get('/air/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    create: (id: string, data: any) => api.post(`/air/status/${id}`, data, { params: { type: 'openweathermap_aqi' } }),
    delete: (id: string) => api.delete(`/air/status/${id}`),
  },
  // Bus
  bus: {
    getAll: async () => {
      const res = await api.get('/bus/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    delete: (id: string) => api.delete(`/bus/status/${id}`),
  },
  // Parking
  parking: {
    getAll: async () => {
      const res = await api.get('/parking/status');
      return Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
    },
    delete: (id: string) => api.delete(`/parking/status/${id}`),
  },
};