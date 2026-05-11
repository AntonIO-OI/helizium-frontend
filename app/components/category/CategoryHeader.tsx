import { Category } from '@/app/lib/api/categories';
import { useState } from 'react';
import CategoryManagement from './CategoryManagement';

interface CategoryHeaderProps {
  category: Category;
  currentUser: { id: string; isAdmin: boolean } | null;
  onCategoryDeleted: () => void;
  onCategoryUpdated: (updated: Category) => void;
}

export default function CategoryHeader({
  category,
  currentUser,
  onCategoryDeleted,
  onCategoryUpdated,
}: CategoryHeaderProps) {
  const [currentCategory, setCurrentCategory] = useState(category);

  const handleUpdate = (updated: Category) => {
    setCurrentCategory(updated);
    onCategoryUpdated(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{currentCategory.title}</h1>
          {currentCategory.description && (
            <p className="text-gray-600 mt-2">{currentCategory.description}</p>
          )}
        </div>
        <CategoryManagement
          category={currentCategory}
          currentUser={currentUser}
          onCategoryDeleted={onCategoryDeleted}
          onCategoryUpdated={handleUpdate}
        />
      </div>
    </div>
  );
}
