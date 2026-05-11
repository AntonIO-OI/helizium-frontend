import { apiClient } from './client';

export interface CategoryPermissions {
  categoriesGranted: string[];
  categoriesRevoked: string[];
  topicsGranted: string[];
  topicsRevoked: string[];
}

export interface UserCategoryPermission {
  categoryId: string;
  permissions: CategoryPermissions;
}

export const permissionsApi = {
  async getCategoryPermissions(userId: string, categoryId: string) {
    return apiClient.get<{ permissions: string[] }>(
      `/v1/u/${userId}/p/c/${categoryId}`,
    );
  },

  async setCategoryPermissions(
    userId: string,
    categoryId: string,
    permissions: CategoryPermissions,
  ) {
    return apiClient.post<void>(
      `/v1/u/${userId}/p/c/${categoryId}`,
      permissions,
    );
  },

  async revokeCategoryPermissions(userId: string, categoryId: string) {
    return apiClient.delete<void>(`/v1/u/${userId}/p/c/${categoryId}`);
  },
};
