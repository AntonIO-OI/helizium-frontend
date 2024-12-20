import { useState } from 'react';
import { Category } from '@/app/types/search';
import { updateCategory } from '@/app/utils/categories';
import { AlertCircle } from 'lucide-react';

interface CategoryEditFormProps {
  category: Category;
  onCancel: () => void;
  onUpdate: (category: Category) => void;
}

export default function CategoryEditForm({
  category,
  onCancel,
  onUpdate,
}: CategoryEditFormProps) {
  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description || '');
  const [parentCategory, setParentCategory] = useState<number | null>(
    category.parentCategory,
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }

    const updatedCategory: Category = {
      ...category,
      title,
      description,
      parentCategory,
    };

    const success = updateCategory(updatedCategory);
    if (success) {
      onUpdate(updatedCategory);
    } else {
      setError('Failed to update category');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Update Category
        </button>
      </div>
    </form>
  );
}
