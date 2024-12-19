import { getSearchData } from './storage';
import { TaskStatus } from '../types/search';

export interface UserStats {
  createdTopics: number;
  createdCategories: number;
  completedTasks: number;
}

export function calculateUserStats(userId: number): UserStats {
  const { tasks, categories } = getSearchData();
  
  // Count tasks created by the user
  const createdTopics = tasks.filter(task => task.authorId === userId).length;
  
  // Count categories created by the user
  const createdCategories = categories.filter(category => category.authorId === userId).length;
  
  // Count tasks completed by the user (where they were the performer)
  const completedTasks = tasks.filter(task => 
    task.performerId === userId && 
    task.status === TaskStatus.COMPLETED
  ).length;

  return {
    createdTopics,
    createdCategories,
    completedTasks
  };
}
