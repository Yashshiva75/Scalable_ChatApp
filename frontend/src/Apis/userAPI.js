import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiClient.get(ENDPOINTS.USER_PROFILE);
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await apiClient.put(ENDPOINTS.UPDATE_PROFILE, userData);
  },

  // Get all users
  getAllUsers: async (page = 1, limit = 10) => {
    return await apiClient.get(`${ENDPOINTS.USER_LIST}?page=${page}&limit=${limit}`);
  },

  // Search users
  searchUsers: async (query) => {
    return await apiClient.get(`${ENDPOINTS.USER_LIST}/search?q=${query}`);
  }
};