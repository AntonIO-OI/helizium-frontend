import { ArrowLeft } from 'lucide-react';
import { Category } from '@/app/types/search';

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategory: number | null;
  onNavigateToParent: () => void;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryNavigation({ 
  categories,
  selectedCategory,
  onNavigateToParent,
  onSelectCategory
}: CategoryNavigationProps) {
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const childCategories = categories.filter(c => c.parentCategory === selectedCategory);
  const rootCategories = categories.filter(c => c.parentCategory === null);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {currentCategory ? currentCategory.title : 'All Categories'}
          </h2>
          {currentCategory && (
            <button
              onClick={onNavigateToParent}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
              title="Go to parent category"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {rootCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-1 rounded-full text-sm transition ${
                selectedCategory === category.id 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {(selectedCategory ? childCategories : rootCategories).map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left p-4 rounded-lg transition ${
              selectedCategory === category.id 
                ? 'bg-black text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold mb-1">{category.title}</h3>
            <p className={`text-sm ${
              selectedCategory === category.id 
                ? 'text-gray-300' 
                : 'text-gray-500'
            }`}>
              {category.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
