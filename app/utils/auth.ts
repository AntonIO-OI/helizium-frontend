import { User } from '../types/search';
import { getSearchData } from './storage';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  password: string;
  rating: number;
  completedTasks: number;
  joinDate: string;
}

export function initializeUsers() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('users')) return;

  const initialUsers: AuthUser[] = [
    {
      id: 1,
      username: 'AlexDev',
      avatar: null,
      rating: 4.8,
      completedTasks: 156,
      joinedDate: '2023-01-15',
      email: 'AlexDev@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
    },
    {
      id: 2,
      username: 'SarahDesigner',
      avatar: null,
      rating: 4.9,
      completedTasks: 243,
      joinedDate: '2022-11-20',
      email: 'SarahDesigner@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
    },
    {
      id: 3,
      username: 'MikeCode',
      avatar: null,
      rating: 4.7,
      completedTasks: 89,
      joinedDate: '2023-03-05',
      email: 'MikeCode@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
    },
  ];

  localStorage.setItem('users', JSON.stringify(initialUsers));
}

export function login(email: string, password: string): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: AuthUser) => 
    u.email === email && u.password === password
  );

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  return null;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
}

export function register(userData: Omit<AuthUser, 'id' | 'rating' | 'completedTasks' | 'joinDate'>): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.some((u: AuthUser) => u.email === userData.email)) {
    return null;
  }

  const newUser: AuthUser = {
    ...userData,
    id: users.length + 1,
    rating: 0,
    completedTasks: 0,
    joinDate: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
} 