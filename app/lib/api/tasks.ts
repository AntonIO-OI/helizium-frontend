import { apiClient } from './client';

export type TaskStatus =
  | 'searching'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Task {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  dueDate: string;
  postedAt: string;
  price: number;
  currency: 'ETH' | 'USD';
  applicants: string[];
  rejectedApplicants: string[];
  performerId: string | null;
  workResult: string | null;
  completed: boolean;
  status: TaskStatus;
  rejectionMessage: string | null;
  contractTxHash: string | null;
  performerRating: number | null;
  disputeRaisedBy: string | null;
  author?: PublicUser;
  performer?: PublicUser;
}

export interface PublicUser {
  id: string;
  username: string;
  rating: number;
  joinedDate: string;
  bio?: string | null;
  location?: string | null;
  industry?: string | null;
  isBanned: boolean;
  isAdmin: boolean;
  ethAddress?: string | null;
}

export interface TasksPage {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTaskDto {
  title: string;
  content: string;
  categoryId: string;
  price: number;
  currency?: 'ETH' | 'USD';
  dueDate: string;
  contractTxHash?: string;
}

export interface EditTaskDto {
  title?: string;
  content?: string;
  categoryId?: string;
  price?: number;
  dueDate?: string;
  contractTxHash?: string;
}

export const tasksApi = {
  async listTasks(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    authorId?: string;
    performerId?: string;
    status?: string;
  }) {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
      });
    }
    const query = qs.toString();
    return apiClient.get<TasksPage>(`/v1/tasks${query ? '?' + query : ''}`);
  },

  async getTask(id: string) {
    return apiClient.get<Task>(`/v1/tasks/${id}`);
  },

  async createTask(dto: CreateTaskDto) {
    return apiClient.post<Task>('/v1/tasks', dto);
  },

  async editTask(id: string, dto: EditTaskDto) {
    return apiClient.put<Task>(`/v1/tasks/${id}`, dto);
  },

  async deleteTask(id: string) {
    return apiClient.delete<void>(`/v1/tasks/${id}`);
  },

  async applyForTask(id: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/apply`);
  },

  async approveApplicant(id: string, applicantId: string, contractTxHash?: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/approve/${applicantId}`, { contractTxHash });
  },

  async rejectApplicant(id: string, applicantId: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/reject/${applicantId}`);
  },

  async submitWork(id: string, workResult: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/submit-work`, { workResult });
  },

  async completeTask(id: string, contractTxHash?: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/complete`, { contractTxHash });
  },

  async rejectWork(id: string, rejectionMessage: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/reject-work`, { rejectionMessage });
  },

  async discardFreelancer(id: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/discard-freelancer`);
  },

  async rateTask(id: string, rating: number) {
    return apiClient.post<Task>(`/v1/tasks/${id}/rate`, { rating });
  },

  async raiseDispute(id: string, contractTxHash?: string) {
    return apiClient.post<Task>(`/v1/tasks/${id}/raise-dispute`, { contractTxHash });
  },

  async resolveDispute(
    id: string,
    favorFreelancer: boolean,
    contractTxHash?: string,
  ) {
    return apiClient.post<Task>(`/v1/tasks/${id}/resolve-dispute`, {
      favorFreelancer,
      contractTxHash,
    });
  },

  async getPublicUser(userId: string) {
    return apiClient.get<PublicUser>(`/v1/u/${userId}/public`);
  },
};
