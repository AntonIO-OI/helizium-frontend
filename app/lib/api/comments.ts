import { apiClient } from './client';

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
  isAuthor: boolean;
}

export const commentsApi = {
  async getComments(taskId: string) {
    return apiClient.get<Comment[]>(`/v1/tasks/${taskId}/comments`);
  },

  async createComment(taskId: string, text: string) {
    return apiClient.post<Comment>(`/v1/tasks/${taskId}/comments`, { text });
  },

  async deleteComment(taskId: string, commentId: string) {
    return apiClient.delete<void>(
      `/v1/tasks/${taskId}/comments/${commentId}`,
    );
  },
};
