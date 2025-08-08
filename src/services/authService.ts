import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  async register(username: string, email: string, password: string) {
    const response = await api.post('/register', { username, email, password });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/me');
    return response.data;
  }
};