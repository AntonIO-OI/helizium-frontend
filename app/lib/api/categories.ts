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

export const ROOT_DISPLAY_NAME = 'Helizium Marketplace';

export function getCategoryDisplayName(category: Category): string {
  if (!category.parent && (category.title === 'ROOT' || !category.parent)) {
    return ROOT_DISPLAY_NAME;
  }
  return category.title;
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

    const all: Category[] = [root.data.category];
    const level1 = root.data.nestedCategories;
    all.push(...level1);

    // Fetch level 2 in parallel
    const level2Results = await Promise.all(
      level1.map((cat) =>
        apiClient.get<CategoryFullInfo>(`/v1/categories/${cat.id}`)
      )
    );

    const level2: Category[] = [];
    for (const res of level2Results) {
      if (res.data?.nestedCategories?.length) {
        all.push(...res.data.nestedCategories);
        level2.push(...res.data.nestedCategories);
      }
    }

    // Fetch level 3 in parallel
    const level3Results = await Promise.all(
      level2.map((cat) =>
        apiClient.get<CategoryFullInfo>(`/v1/categories/${cat.id}`)
      )
    );

    for (const res of level3Results) {
      if (res.data?.nestedCategories?.length) {
        all.push(...res.data.nestedCategories);
      }
    }

    return all;
  },

  getRootId(categories: Category[]): string | null {
    return categories.find((c) => c.parent === null || c.parent === undefined)?.id ?? null;
  },
};
