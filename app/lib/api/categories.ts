import { apiClient } from './client';

export interface Category {
  id: string;
  location: string;
  parent: string | null;
  owner: string;
  title: string;
  description?: string;
  allowedTopicTypes: string[];
  permissions: {
    categoriesGranted: string[];
    categoriesRevoked: string[];
    topicsGranted: string[];
    topicsRevoked: string[];
  };
  isDeleted: boolean;
  isPinned: boolean;
  subscribedUsers: string[];
}

export interface CategoryFullInfo {
  category: Category;
  nestedCategories: Category[];
}

export interface CreateCategoryDto {
  title: string;
  parentLocation: string;
  description?: string;
  allowedTopicTypes: string[];
  permissions: {
    categoriesGranted: string[];
    categoriesRevoked: string[];
    topicsGranted: string[];
    topicsRevoked: string[];
  };
}

export interface EditCategoryDto {
  title: string;
  description?: string;
  allowedTopicTypes: string[];
  permissions: {
    categoriesGranted: string[];
    categoriesRevoked: string[];
    topicsGranted: string[];
    topicsRevoked: string[];
  };
}

export const categoriesApi = {
  async getRoot() {
    return apiClient.get<CategoryFullInfo>('/v1/categories');
  },

  async getCategory(id: string) {
    return apiClient.get<CategoryFullInfo>(`/v1/categories/${id}`);
  },

  async getCategoryInfo(id: string) {
    return apiClient.get<Category>(`/v1/categories/${id}/info`);
  },

  async createCategory(dto: CreateCategoryDto) {
    return apiClient.post<void>('/v1/categories', dto);
  },

  async editCategory(id: string, dto: EditCategoryDto) {
    return apiClient.put<void>(`/v1/categories/${id}`, dto);
  },

  async deleteCategory(id: string) {
    return apiClient.delete<void>(`/v1/categories/${id}`);
  },

  async pinCategory(id: string) {
    return apiClient.put<void>(`/v1/categories/${id}/pin`);
  },

  async unpinCategory(id: string) {
    return apiClient.put<void>(`/v1/categories/${id}/unpin`);
  },

  async restoreCategory(id: string, restoreInner: boolean) {
    return apiClient.post<void>(`/v1/categories/${id}/restore`, {
      restoreInner,
    });
  },

  async listAllCategories(): Promise<Category[]> {
    const root = await apiClient.get<CategoryFullInfo>('/v1/categories');
    if (!root.data) return [];
    const all: Category[] = [root.data.category, ...root.data.nestedCategories];
    return all;
  },
};
