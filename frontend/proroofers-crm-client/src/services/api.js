import axios from 'axios';

const API_BASE_URL = 'http://localhost:5120/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const taskAPI = {
  getAll: () => apiClient.get('/tasks'),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (task) => apiClient.post('/tasks', task),
  update: (id, task) => apiClient.put(`/tasks/${id}`, task),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
};

export const userAPI = {
  getAll: () => apiClient.get('/users'),
};

export const customerAPI = {
  getAll: () => apiClient.get('/customers'),
  create: (customer) => apiClient.post('/customers', customer),
  update: (id, customer) => apiClient.put(`/customers/${id}`, customer),
  delete: (id) => apiClient.delete(`/customers/${id}`), // Add this if missing
};

export const projectAPI = {
    getAll: () => apiClient.get('/projects'),
    getById: (id) => apiClient.get(`/projects/${id}`),
    getByCustomerId: (customerId) => apiClient.get(`/projects/customer/${customerId}`),
    create: (project) => apiClient.post('/projects', project),
    update: (id, project) => apiClient.put(`/projects/${id}`, project),
    delete: (id) => apiClient.delete(`/projects/${id}`),
};

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
};