import { Category, User } from '@/app/types/search';
import { useState } from 'react';
import DeleteCategoryButton from './DeleteCategoryButton';
import CategoryEditForm from './CategoryEditForm';
import { Pencil } from 'lucide-react';

interface CategoryManagementProps {
  category: Category;
  currentUser: User | null;
  onCategoryDeleted: () => void;
  onCategoryUpdated: (category: Category) => void;
}

export default function CategoryManagement({
  category,
  currentUser,
  onCategoryDeleted,
  onCategoryUpdated
}: CategoryManagementProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!currentUser?.admin) return null;

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
          <CategoryEditForm
            category={category}
            onCancel={() => setIsEditing(false)}
            onUpdate={(updatedCategory) => {
              onCategoryUpdated(updatedCategory);
              setIsEditing(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <DeleteCategoryButton
        categoryId={category.id}
        isRootCategory={category.parentCategory === null}
        onDelete={onCategoryDeleted}
      />
    </div>
  );
}