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

export interface CategoryPermissionRecord {
  userId: string;
  setBy: string;
  categoryId: string;
  categoriesGranted: string[];
  categoriesRevoked: string[];
  topicsGranted: string[];
  topicsRevoked: string[];
  revokedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  async getMe() {
    return apiClient.get<UserInfoResponse>('/v1/u/me');
  },

  // Global permissions - correct backend routes
  async getGlobalPermissions(userId: string) {
    return apiClient.get<{ permissions: string[] }>(`/v1/u/${userId}/p/g`);
  },

  async setGlobalPermissions(userId: string, permissions: string[]) {
    return apiClient.post<void>(`/v1/u/${userId}/p/g`, { permissions });
  },

  async revokeAllGlobalPermissions(userId: string) {
    return apiClient.delete<void>(`/v1/u/${userId}/p/g`);
  },

  // Category permissions
  async getCategoryPermissions(userId: string, categoryId: string) {
    return apiClient.get<{ permissions: CategoryPermissionRecord[] }>(
      `/v1/u/${userId}/p/c/${categoryId}`
    );
  },

  async setCategoryPermissions(
    userId: string,
    categoryId: string,
    data: {
      categoriesGranted: string[];
      categoriesRevoked: string[];
      topicsGranted: string[];
      topicsRevoked: string[];
    }
  ) {
    return apiClient.post<void>(`/v1/u/${userId}/p/c/${categoryId}`, data);
  },

  async revokeCategoryPermissions(userId: string, categoryId: string) {
    return apiClient.delete<void>(`/v1/u/${userId}/p/c/${categoryId}`);
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

  async updateEthAddress(ethAddress: string) {
    return apiClient.put<void>('/v1/u/me/eth-address', { ethAddress });
  },
};
