import { Category, Task } from '../types/search';
import { getSearchData } from './storage';

export const getChildCategoryIds = (categoryId: number): number[] => {
  const { categories } = getSearchData();
  const childCategories = categories.filter(c => c.parentCategory === categoryId);
  const childIds = childCategories.map(c => c.id);
  
  const grandChildIds = childCategories.flatMap(c => getChildCategoryIds(c.id));
  
  return [...childIds, ...grandChildIds];
}; 

export function deleteCategory(categoryId: number): boolean {
  try {
    const storedData = localStorage.getItem('searchData');
    if (!storedData) return false;
    
    const searchData = JSON.parse(storedData);
    const { categories, tasks } = searchData;
    
    const categoryToDelete = categories.find((c: Category) => c.id === categoryId);
    if (!categoryToDelete) return false;
    
    if (categoryToDelete.parentCategory === null) return false;
    
    const parentCategory = categories.find((c: Category) => c.id === categoryToDelete.parentCategory);
    if (!parentCategory) return false;
    
    const updatedTasks = tasks.map((task: Task) => {
      if (task.category === categoryId) {
        return { ...task, category: parentCategory.id };
      }
      return task;
    });
    
    const updatedCategories = categories.map((category: Category) => {
      if (category.parentCategory === categoryId) {
        return { ...category, parentCategory: parentCategory.id };
      }
      return category;
    }).filter((c: Category) => c.id !== categoryId);
    
    const updatedSearchData = {
      ...searchData,
      categories: updatedCategories,
      tasks: updatedTasks
    };
    
    localStorage.setItem('searchData', JSON.stringify(updatedSearchData));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
}

export function updateCategory(updatedCategory: Category): boolean {
  try {
    const storedData = localStorage.getItem('searchData');
    if (!storedData) return false;
    
    const searchData = JSON.parse(storedData);
    const { categories } = searchData;
    
    const categoryIndex = categories.findIndex((c: Category) => c.id === updatedCategory.id);
    if (categoryIndex === -1) return false;
    
    categories[categoryIndex] = updatedCategory;
    
    localStorage.setItem('searchData', JSON.stringify({
      ...searchData,
      categories
    }));
    
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
}