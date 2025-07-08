
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// 请求拦截器，用于在每个请求中附加token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- 认证 API ---
export const auth = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
};

// --- 数据 API ---

// 灵感 API
export const inspirations = {
  getAll: () => apiClient.get('/inspirations'),
  create: (data) => apiClient.post('/inspirations', data),
  update: (id, data) => apiClient.put(`/inspirations/${id}`, data),
  delete: (id) => apiClient.delete(`/inspirations/${id}`),
};

// 知识 API
export const knowledge = {
  getAll: () => apiClient.get('/knowledge'),
  create: (data) => apiClient.post('/knowledge', data),
  update: (id, data) => apiClient.put(`/knowledge/${id}`, data),
  delete: (id) => apiClient.delete(`/knowledge/${id}`),
};

// 任务 API
export const tasks = {
  getAll: () => apiClient.get('/tasks'),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
};

// 目标 API
export const goals = {
  getAll: () => apiClient.get('/goals'),
  create: (data) => apiClient.post('/goals', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  delete: (id) => apiClient.delete(`/goals/${id}`),
  getTasks: (id) => apiClient.get(`/goals/${id}/tasks`),
};

// 分类 API
export const categories = {
  getAll: () => apiClient.get('/categories'),
  create: (data) => apiClient.post('/categories', data),
};

// 搜索 API
export const search = {
  run: (searchTerm) => apiClient.get(`/search?q=${encodeURIComponent(searchTerm)}`),
};

// 统计 API
export const statistics = {
  get: () => apiClient.get('/statistics'),
};
