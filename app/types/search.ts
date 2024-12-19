export interface Category {
  id: number;
  parentCategory: number | null;
  title: string;
  description: string;
  authorId: number;
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
  applicants: number[];
  rejectedApplicants: number[];
  performerId: number | null;
  workResult: string | null;
  completed: boolean;
  status: TaskStatus;
  rejectionMessage: string | null;
}

export enum TaskStatus {
  SEARCHING = 'searching',
  IN_PROGRESS = 'in_progress',
  WAITING_APPROVAL = 'waiting_approval',
  COMPLETED = 'completed'
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
