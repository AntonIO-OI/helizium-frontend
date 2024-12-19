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
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      rating: 4.8,
      completedTasks: 15,
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      rating: 4.9,
      completedTasks: 23,
      joinDate: '2024-01-10'
    },
    {
      id: 3,
      username: 'bob_wilson',
      email: 'bob@example.com',
      password: 'password123',
      rating: 4.7,
      completedTasks: 18,
      joinDate: '2024-01-20'
    }
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