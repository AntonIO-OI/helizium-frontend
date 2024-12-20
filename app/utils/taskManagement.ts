import { Task, ContractSignature } from '../types/search';
import { getSearchData, saveTasks } from './storage';
import { updateTaskStatus } from './tasks';
import { TaskStatus } from '../types/search';
import { getUser } from '../data/mockUsers';

export function applyForTask(taskId: number, userId: number): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || task.performerId || task.applicants.includes(userId)) {
    return null;
  }

  const updatedTask = {
    ...task,
    applicants: [...task.applicants, userId]
  };

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function rejectWorkResult(taskId: number, authorId: number, message: string): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || task.authorId !== authorId || task.status !== TaskStatus.WAITING_APPROVAL) {
    return null;
  }

  const updatedTask = updateTaskStatus({
    ...task,
    workResult: null,
    rejectionMessage: message,
    status: TaskStatus.IN_PROGRESS
  });

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function rejectApplicant(taskId: number, userId: number): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || !task.applicants.includes(userId)) {
    return null;
  }

  const updatedTask = {
    ...task,
    applicants: task.applicants.filter(id => id !== userId),
    rejectedApplicants: [...task.rejectedApplicants, userId]
  };

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function approveApplicant(
  taskId: number, 
  userId: number, 
  contractSignature: ContractSignature
): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || task.performerId || !task.applicants.includes(userId) || !contractSignature) {
    return null;
  }

  const updatedTask = updateTaskStatus({
    ...task,
    applicants: [],
    performerId: userId,
    status: TaskStatus.IN_PROGRESS,
    contractSignature
  });

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function submitWorkResult(taskId: number, userId: number, workResult: string): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || task.performerId !== userId || task.completed) {
    return null;
  }

  const updatedTask = updateTaskStatus({
    ...task,
    workResult,
    status: TaskStatus.WAITING_APPROVAL
  });

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function completeTask(taskId: number, authorId: number): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || task.authorId !== authorId || !task.workResult || task.completed) {
    return null;
  }

  const updatedTask = updateTaskStatus({
    ...task,
    completed: true,
    status: TaskStatus.COMPLETED
  });

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
}

export function deleteTask(
  taskId: number, 
  currentUserId: number,
  contractSignature: ContractSignature
): boolean {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  const currentUser = getUser(currentUserId);
  
  if (!task || (!currentUser?.admin && task.authorId !== currentUserId) || !contractSignature) {
    return false;
  }

  if (task.status !== TaskStatus.SEARCHING) {
    return false;
  }

  const updatedTasks = tasks.filter(t => t.id !== taskId);
  saveTasks(updatedTasks);
  return true;
}

export function editTask(
  taskId: number, 
  authorId: number, 
  updates: Partial<Task>
): Task | null {
  const { tasks } = getSearchData();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || 
      task.authorId !== authorId || 
      task.status !== TaskStatus.SEARCHING ||
      task.applicants.length > 0) {
    return null;
  }

  const updatedTask = {
    ...task,
    ...updates,
    // Ensure these fields cannot be modified
    id: task.id,
    authorId: task.authorId,
    status: task.status,
    applicants: task.applicants,
    rejectedApplicants: task.rejectedApplicants,
    performerId: task.performerId,
    workResult: task.workResult,
    completed: task.completed
  };

  const updatedTasks = tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  saveTasks(updatedTasks);
  return updatedTask;
} 