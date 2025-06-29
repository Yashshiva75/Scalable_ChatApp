import { authApi } from './authApis';
import { chatAPI } from './chatAPI';
import { handleApiError, showErrorToast } from './errorHandler';
import { ENDPOINTS } from './endpoint';
import apiClient from './appClient';

// Export all APIs
export { authApi, chatAPI, handleApiError, showErrorToast, ENDPOINTS, apiClient };

// Combined API object
export const API = {
  auth: authApi,
  chat: chatAPI
};
