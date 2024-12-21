import { Message } from '../components/PersonalChat';
import { User } from '../types/search';

export const saveTestUsers = () => {
  const usersFromLocalStorage = localStorage.getItem('users');

  const users: User[] = [
    {
      id: 1,
      username: 'AlexDev',
      rating: 4.8,
      completedTasks: 156,
      joinedDate: '2023-01-15',
      email: 'AlexDev@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
      banned: false,
    },
    {
      id: 2,
      username: 'SarahDesigner',
      rating: 4.9,
      completedTasks: 243,
      joinedDate: '2022-11-20',
      email: 'SarahDesigner@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
      banned: false,
    },
    {
      id: 3,
      username: 'MikeCode',
      rating: 4.7,
      completedTasks: 89,
      joinedDate: '2023-03-05',
      email: 'MikeCode@gmail.com',
      emailConfirmed: true,
      password: 'asdf1234A!',
      admin: true,
      mfa: false,
      totp: false,
      banned: false,
    },
  ];

  const realUsers: User[] = JSON.parse(usersFromLocalStorage ?? '[]');
  const toSave: User[] = [];
  for (const user of users) {
    if (!realUsers.find((r) => r.id === user.id)) {
      toSave.push(user);
    }
  }

  if (toSave.length) {
    localStorage.setItem('users', JSON.stringify([...realUsers, ...toSave]));
  }
};

export const getUser = (id: number): User | undefined => {
  const usersFromLocalStorage = localStorage.getItem('users');

  if (!usersFromLocalStorage) {
    return undefined;
  }

  const users: User[] = JSON.parse(usersFromLocalStorage);

  return users.find((user) => user.id === id);
};

export const deleteUser = (id: number) => {
  const usersFromLocalStorage = localStorage.getItem('users');

  if (!usersFromLocalStorage) {
    return undefined;
  }

  const users: User[] = JSON.parse(usersFromLocalStorage);
  localStorage.setItem(
    'users',
    JSON.stringify(users.filter((user) => user.id !== id)),
  );

  const chatData = localStorage.getItem('personalChat');
  if (chatData) {
    const messages: Message[] = JSON.parse(chatData);
    messages.filter((msg) => msg.from !== id && msg.to !== id);

    localStorage.setItem('personalChat', JSON.stringify(messages));
  }
};

export const addUser = (user: User) => {
  const usersFromLocalStorage = localStorage.getItem('users');
  const users: User[] = JSON.parse(usersFromLocalStorage ?? '[]');
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};
