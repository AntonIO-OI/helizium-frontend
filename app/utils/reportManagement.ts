import { Report } from '../types/search';

export function saveReports(reports: Report[]) {
  localStorage.setItem('reports', JSON.stringify(reports));
}

export function getReports(): Report[] {
  const reportsJson = localStorage.getItem('reports');
  return reportsJson ? JSON.parse(reportsJson) : [];
}

export function createReport(
  taskId: number,
  reporterId: number,
  reason: string
): Report {
  const reports = getReports();
  const newReport: Report = {
    id: Math.max(0, ...reports.map(r => r.id)) + 1,
    taskId,
    reporterId,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  saveReports([...reports, newReport]);
  return newReport;
}

export function updateReportStatus(
  reportId: number,
  status: 'resolved' | 'dismissed'
): Report | null {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex === -1) return null;
  
  const updatedReport = {
    ...reports[reportIndex],
    status
  };
  
  reports[reportIndex] = updatedReport;
  saveReports(reports);
  return updatedReport;
}

export function getUserReportCount(taskId: number, userId: number): number {
  const reports = getReports();
  return reports.filter(
    r => r.taskId === taskId && r.reporterId === userId
  ).length;
}

export function canUserReport(taskId: number, userId: number): boolean {
  return getUserReportCount(taskId, userId) < 3;
} 