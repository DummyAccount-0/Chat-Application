import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const chatService = {
  // User operations
  async searchUsers(query: string) {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },

  async getDirectMessages(userId: string, page = 1) {
    const response = await api.get(`/users/messages/${userId}?page=${page}`);
    return response.data;
  },

  async getConversations() {
    const response = await api.get('/users/conversations');
    return response.data;
  },

  // Team operations
  async createTeam(teamData: { name: string; description?: string; isPrivate?: boolean }) {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  async getUserTeams() {
    const response = await api.get('/teams');
    return response.data;
  },

  async getTeamMessages(teamId: string, page = 1) {
    const response = await api.get(`/teams/${teamId}/messages?page=${page}`);
    return response.data;
  },

  async addTeamMember(teamId: string, userId: string) {
    const response = await api.post(`/teams/${teamId}/members`, { userId });
    return response.data;
  }
};