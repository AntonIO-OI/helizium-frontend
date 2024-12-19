export interface ProfileData {
  username: string;
  email: string;
  isEmailConfirmed: boolean;
  stats: {
    createdTopics: number;
    createdCategories: number;
    completedTasks: number;
  };
  bio: string;
}