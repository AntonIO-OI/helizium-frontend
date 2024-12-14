export interface Category {
  id: number;
  parentCategory?: number;
  title: string;
  description: string;
}

export interface Task {
  id: number;
  category: number;
  title: string;
  content: string;
  date: string;
  price: number;
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