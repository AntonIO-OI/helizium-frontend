export interface Category {
  id: number;
  parentCategory: number | null;
  title: string;
  description: string;
}

export interface Task {
  id: number;
  category: number;
  authorId: number;
  title: string;
  content: string;
  date: string;
  posted: string;
  price: number;
}

export interface User {
  id: number;
  username: string;
  rating: number;
  completedTasks: number;
  joinedDate: string;
  bio?: string;
  location?: string;
  email?: string;
  industry?: string;
  avatar?: string;
}

export interface SearchData {
  categories: Category[];
  tasks: Task[];
}

export type SortField = 'title' | 'date' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
} 