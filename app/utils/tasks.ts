import { Task, TaskStatus } from '../types/search';

export function getTaskStatus(task: Task): TaskStatus {
  if (task.completed) {
    return TaskStatus.COMPLETED;
  }
  
  if (task.workResult) {
    return TaskStatus.WAITING_APPROVAL;
  }
  
  if (task.performerId) {
    return TaskStatus.IN_PROGRESS;
  }
  
  return TaskStatus.SEARCHING;
}

export function updateTaskStatus(task: Task): Task {
  return {
    ...task,
    status: getTaskStatus(task)
  };
} 