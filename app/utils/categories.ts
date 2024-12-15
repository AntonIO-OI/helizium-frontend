import { getSearchData } from './storage';

export const getChildCategoryIds = (categoryId: number): number[] => {
  const { categories } = getSearchData();
  const childCategories = categories.filter(c => c.parentCategory === categoryId);
  const childIds = childCategories.map(c => c.id);
  
  const grandChildIds = childCategories.flatMap(c => getChildCategoryIds(c.id));
  
  return [...childIds, ...grandChildIds];
}; 