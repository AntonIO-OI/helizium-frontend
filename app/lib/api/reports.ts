import { apiClient } from './client';

export interface Report {
  id: string;
  taskId: string;
  reporterId: string;
  reporterUsername: string;
  taskTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const reportsApi = {
  async createReport(taskId: string, reason: string) {
    return apiClient.post<Report>(`/v1/tasks/${taskId}/reports`, { reason });
  },

  async getReports() {
    return apiClient.get<Report[]>('/v1/reports');
  },

  async updateReportStatus(
    reportId: string,
    status: 'resolved' | 'dismissed',
  ) {
    return apiClient.put<Report>(`/v1/reports/${reportId}/status`, { status });
  },
};
