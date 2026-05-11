import { ChevronRight } from 'lucide-react';
import { Category } from '../../lib/api/categories';

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategory: string | null;
  onNavigateToParent: () => void;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryNavigation({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryNavigationProps) {
  const getBreadcrumbPath = (
    categoryId: string | null,
  ): Array<{ id: string | null; title: string }> => {
    const path: Array<{ id: string | null; title: string }> = [
      { id: null, title: 'All Categories' },
    ];
    if (!categoryId) return path;

    const pathCategories: Category[] = [];
    let current = categories.find((c) => c.id === categoryId);
    while (current) {
      pathCategories.unshift(current);
      current = categories.find((c) => c.id === current?.parent);
    }

    pathCategories.forEach((cat) => {
      path.push({ id: cat.id, title: cat.title });
    });

    return path;
  };

  const childCategories = categories.filter(
    (c) => c.parent === selectedCategory,
  );
  const breadcrumbPath = getBreadcrumbPath(selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {breadcrumbPath.map((item, index) => (
          <div key={item.id ?? 'root'} className="flex items-center">
            <button
              onClick={() => onSelectCategory(item.id)}
              className={`text-sm transition ${
                selectedCategory === item.id
                  ? 'font-semibold text-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.title}
            </button>
            {index < breadcrumbPath.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {childCategories.length === 0 && selectedCategory !== null && (
          <p className="text-sm text-gray-400 italic">No subcategories</p>
        )}
        {childCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="w-full text-left p-4 rounded-lg transition bg-white hover:bg-gray-50 border border-gray-100"
          >
            <h3 className="font-semibold mb-1">{category.title}</h3>
            {category.description && (
              <p className="text-sm text-gray-500">{category.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
