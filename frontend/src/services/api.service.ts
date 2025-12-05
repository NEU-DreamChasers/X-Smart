import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

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
    if (offset !== undefined) params.offset = offset;

    try {
      const res = await api.get(url, { params });
      const totalCount = parseInt(res.headers['ngsild-results-count'] || res.headers['x-total-count'] || '0', 10);
      const parsedData = Array.isArray(res.data) ? res.data.map(parseNgsi) : [];
      return { data: parsedData, totalCount };
    } catch (error) {
      console.error(`Error fetching ${domain}:`, error);
      return { data: [], totalCount: 0 };
    }
  };

export const ApiService = {
  map: {
    searchNearby: async (lat: number, lon: number, radius: number = 5000) => {
       try {
         const res = await api.get('/map/search-nearby', { params: { lat, lon, radius } });
         return res.data; 
       } catch (error) {
         return [];
       }
    }
  },

  sources: {
    getAll: async (limit?: number, offset?: number) => {
      const res = await api.get('/sources', { params: { limit, offset } });
      return { data: res.data, totalCount: parseInt(res.headers['x-total-count'] || '0', 10) };
    },
    getOne: (id: string) => api.get(`/sources/${id}`).then(res => res.data),
    create: (data: any) => api.post('/sources', data).then(res => res.data),
    update: (id: string, data: any) => api.patch(`/sources/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/sources/${id}`).then(res => res.data),
  },

  weather: {
    getAll: createNgsiGetAll('weather'),
  },
  air: {
    getAll: createNgsiGetAll('air'),
  },
  bus: {
    getAll: createNgsiGetAll('bus'),
  },
  parking: {
    getAll: createNgsiGetAll('parking'),
  },

  history: {
    getTemperatureChart: async (location: string) => {
        try { const res = await api.get(`/history/chart/temperature/${location}`); return res.data; } catch (e) { return []; }
    },
    getAqiChart: async (location: string) => {
        try { const res = await api.get(`/history/chart/aqi/${location}`); return res.data; } catch (e) { return []; }
    },
    getRainChart: async (location: string) => {
        try { const res = await api.get(`/history/chart/precipitation/${location}`); return res.data; } catch (e) { return []; }
    }
  },

  reports: {
    getMyReports: async () => {
        try {
            const res = await api.get('/reports/my-reports');
            return { 
                data: Array.isArray(res.data) ? res.data : [], 
                totalCount: Array.isArray(res.data) ? res.data.length : 0 
            };
        } catch (error) {
            console.warn('Lỗi lấy báo cáo:', error);
            return { data: [], totalCount: 0 };
        }
    },
    create: async (formData: FormData) => {
        const res = await api.post('/reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    }
  }
};