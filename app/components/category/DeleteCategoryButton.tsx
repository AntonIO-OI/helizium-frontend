import { useState } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { deleteCategory } from '@/app/utils/categories';

interface DeleteCategoryButtonProps {
  categoryId: number;
  isRootCategory: boolean;
  onDelete: () => void;
}

export default function DeleteCategoryButton({
  categoryId,
  isRootCategory,
  onDelete
}: DeleteCategoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (isRootCategory) {
      setError('Root categories cannot be deleted');
      return;
    }

    const success = deleteCategory(categoryId);
    if (success) {
      onDelete();
    } else {
      setError('Failed to delete category');
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
        disabled={isRootCategory}
        title={isRootCategory ? "Root categories cannot be deleted" : ""}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this category? All tasks will be moved to the parent category.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 