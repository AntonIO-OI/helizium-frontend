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

export interface ApiToken {
  title: string;
  token: string;
  readonly: boolean;
}

export interface User {
  id: number;
  email: string;
  emailConfirmed: boolean;
  password: string;
  username: string;
  avatar: string | null;
  rating: number;
  completedTasks: number;
  joinedDate: string;
  admin: boolean;
  mfa: boolean;
  totp: boolean;
  apiTokens?: ApiToken[];
  bio?: string;
}

export interface Comment {
  id: number,
  userId: number,
  taskId: number,
  text: string,
  createdAt: string,
}

export interface SearchData {
  categories: Category[];
  tasks: Task[];
  comments: Comment[];
}

export type SortField = 'title' | 'date' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
