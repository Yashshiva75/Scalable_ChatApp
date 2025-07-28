import apiClient from './appClient';
import { ENDPOINTS } from './endpoint';

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiClient.get(ENDPOINTS.USER_PROFILE);
  },

  // Update user profile
  // updateProfile: async (userData) => {
  //   return await apiClient.put(ENDPOINTS.UPDATE_PROFILE, userData);
  // },

  // Get all users
  getAllUsers: async () => {
    return await apiClient.get(ENDPOINTS.USER_LIST);
  },

  // Search users
  searchUsers: async (query) => {
    return await apiClient.get(`${ENDPOINTS.USER_LIST}/search?q=${query}`);
  }
};