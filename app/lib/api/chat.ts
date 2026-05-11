import { apiClient } from './client';

export interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  postedAt: string;
  readAt: string | null;
  fromUsername: string;
}

export interface ChatPreview {
  contactId: string;
  contactUsername: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const chatApi = {
  async getChats() {
    return apiClient.get<ChatPreview[]>('/v1/chat');
  },

  async getMessages(contactId: string) {
    return apiClient.get<Message[]>(`/v1/chat/${contactId}`);
  },

  async sendMessage(contactId: string, message: string) {
    return apiClient.post<Message>(`/v1/chat/${contactId}`, { message });
  },

  async markRead(contactId: string) {
    return apiClient.put<void>(`/v1/chat/${contactId}/read`);
  },
};
