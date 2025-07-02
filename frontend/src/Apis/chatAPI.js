import apiClient from './appClient';
import { ENDPOINTS } from './endpoint';

export const chatAPI = {
  // Send message
  sendMessage: async ({receiverId,message}) => {
    return await apiClient.post(`${ENDPOINTS.SEND_MESSAGE}/${receiverId}`,{message});
  },

  // Get messages for a chat
  getMessages: async (chatId, page = 1, limit = 50) => {
    return await apiClient.get(`${ENDPOINTS.GET_MESSAGES}/${chatId}?page=${page}&limit=${limit}`);
  },

  getConversation :async(id) =>{
    return await apiClient.get(`${ENDPOINTS.GET_CONVO}/${id}`)
  },
  // Create chat room
  createRoom: async (roomData) => {
    return await apiClient.post(ENDPOINTS.CREATE_ROOM, roomData);
  },

  // Join chat room
  joinRoom: async (roomId) => {
    return await apiClient.post(`${ENDPOINTS.JOIN_ROOM}/${roomId}`);
  },

  // Get user's chat rooms
  getRooms: async () => {
    return await apiClient.get(ENDPOINTS.GET_ROOMS);
  },

  // Delete message
  deleteMessage: async (messageId) => {
    return await apiClient.delete(`${ENDPOINTS.SEND_MESSAGE}/${messageId}`);
  }
};