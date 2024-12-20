import { Category, User } from '@/app/types/search';
import { useState } from 'react';
import CategoryManagement from './CategoryManagement';
import CategoryEditForm from './CategoryEditForm';

interface CategoryHeaderProps {
  category: Category;
  currentUser: User | null;
  onCategoryDeleted: () => void;
}

export default function CategoryHeader({
  category,
  currentUser,
  onCategoryDeleted
}: CategoryHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(category);

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
          onCategoryUpdated={(updatedCategory) => {
            setCurrentCategory(updatedCategory);
            setIsEditing(false);
          }}
        />
      </div>
      
      {isEditing && currentUser?.admin && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <CategoryEditForm
            category={currentCategory}
            onCancel={() => setIsEditing(false)}
            onUpdate={(updatedCategory) => {
              setCurrentCategory(updatedCategory);
              setIsEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
} 