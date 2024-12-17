import { User } from '../types/search';

export const users: User[] = [
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
  },
];

export const getUser = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};
