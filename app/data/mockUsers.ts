import { User } from '../types/search';

export const users: User[] = [
  {
    id: 1,
    username: "AlexDev",
    avatar: undefined,
    rating: 4.8,
    completedTasks: 156,
    joinedDate: "2023-01-15",
    bio: "Passionate developer with a love for coding and technology."
  },
  {
    id: 2,
    username: "SarahDesigner",
    avatar: undefined,
    rating: 4.9,
    completedTasks: 243,
    joinedDate: "2022-11-20",
    bio: "Creative designer who enjoys crafting beautiful user experiences."
  },
  {
    id: 3,
    username: "MikeCode",
    avatar: undefined,
    rating: 4.7,
    completedTasks: 89,
    joinedDate: "2023-03-05",
    bio: "Enthusiastic coder with a knack for problem-solving and innovation."
  }
];

export const getUser = (id: number): User | undefined => {
  return users.find(user => user.id === id);
}; 