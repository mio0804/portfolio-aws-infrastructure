import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストに認証トークンがある場合は追加
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 認証API（バックエンドのユーザー情報取得のみ）
export const authAPI = {
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ペットAPI
export const petsAPI = {
  getAll: async () => {
    const response = await api.get('/pets');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/pets', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  },
};

// 日記API
export const diariesAPI = {
  getAllByPet: async (petId: string, page = 1) => {
    const response = await api.get(`/pets/${petId}/diaries?page=${page}`);
    return response.data;
  },
  getAll: async (page = 1) => {
    const response = await api.get(`/diaries?page=${page}`);
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/diaries/${id}`);
    return response.data;
  },
  create: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/diaries', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/diaries/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/diaries/${id}`);
    return response.data;
  },
  getPresignedUrl: async (filename: string, fileType: string) => {
    const response = await api.post('/upload/presigned-url', { filename, file_type: fileType });
    return response.data;
  },
};

export default api;