import { apiClient } from './client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  isBanned: boolean;
  avatar?: string;
  balance: number;
  trustRate: number;
  bio?: string;
  location?: string;
  industry?: string;
  ethAddress?: string | null;
  activities: {
    categories: number;
    posts: number;
    comments: number;
  };
  globalPermissions: {
    permissions: string[];
  };
}

export interface UserInfoResponse {
  id: string;
  user: UserProfile;
  categoryPermissions: unknown[];
  topicPermissions: unknown[];
}

export const usersApi = {
  async getMe() {
    return apiClient.get<UserInfoResponse>('/v1/u/me');
  },

  async getGlobalPermissions(userId: string) {
    return apiClient.get<{ permissions: string[] }>(`/v1/u/${userId}/permissions/global`);
  },

  async setGlobalPermissions(userId: string, permissions: string[]) {
    return apiClient.post<void>(`/v1/u/${userId}/permissions/global`, { permissions });
  },

  async revokeAllGlobalPermissions(userId: string) {
    return apiClient.delete<void>(`/v1/u/${userId}/permissions/global`);
  },

  async banUser(userId: string) {
    return apiClient.post<void>(`/v1/users/${userId}/ban`);
  },

  async unbanUser(userId: string) {
    return apiClient.post<void>(`/v1/users/${userId}/unban`);
  },

  async deleteUser(userId: string) {
    return apiClient.post<void>(`/v1/u/${userId}/delete`);
  },

  async updateBio(bio: string) {
    return apiClient.put<void>('/v1/u/me/bio', { bio });
  },

  async updateLocation(location: string) {
    return apiClient.put<void>('/v1/u/me/location', { location });
  },

  async updateIndustry(industry: string) {
    return apiClient.put<void>('/v1/u/me/industry', { industry });
  },

  /** Register the user's Ethereum wallet address. Pass empty string to clear. */
  async updateEthAddress(ethAddress: string) {
    return apiClient.put<void>('/v1/u/me/eth-address', { ethAddress });
  },
};
