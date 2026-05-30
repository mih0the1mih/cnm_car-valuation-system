// frontend/src/services/chatbotService.js
import api from './api';

export const sendMessage = async (message, sessionId) => {
  const response = await api.post('/chat/message', { message, sessionId });
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chat/history/${sessionId}`);
  return response.data;
};
