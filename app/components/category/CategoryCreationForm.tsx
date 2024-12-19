import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/app/types/search';
import { getSearchData, saveCategories } from '@/app/utils/storage';
import { AlertCircle } from 'lucide-react';

interface CategoryCreationFormProps {
  categories: Category[];
  authorId: number;
  disabled?: boolean;
}

export default function CategoryCreationForm({ categories, authorId, disabled = false }: CategoryCreationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (disabled) {
      setError('You are not allowed to create categories at this time');
      setIsLoading(false);
      return;
    }

    if (!title || !description) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const { categories: existingCategories } = getSearchData();
      const newCategory: Category = {
        id: existingCategories.length > 0 ? Math.max(...existingCategories.map(c => c.id)) + 1 : 1,
        title,
        description,
        parentCategory,
        authorId
      };

      saveCategories([...existingCategories, newCategory]);
      router.push('/profile');
    } catch (err) {
      setError('Failed to create category');
      console.error('Error creating category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
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
          placeholder="Enter category title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          placeholder="Enter category description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parent Category
        </label>
        <select
          value={parentCategory || ''}
          onChange={(e) => setParentCategory(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value="">No parent category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || disabled}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Category'}
        </button>
      </div>
    </form>
  );
} 