'use client';

import { ChevronRight, FolderOpen, Folder } from 'lucide-react';
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
  const rootCategory = categories.find(
    (c) => c.parent === null || c.parent === undefined,
  );
  const rootId = rootCategory?.id ?? null;

  const getBreadcrumbPath = (
    categoryId: string | null,
  ): Array<{ id: string | null; title: string }> => {
    const path: Array<{ id: string | null; title: string }> = [
      { id: null, title: 'All Categories' },
    ];
    if (!categoryId) return path;

    const items: Array<{ id: string; title: string }> = [];
    let current = categories.find((c) => c.id === categoryId);

    while (current && current.id !== rootId) {
      items.unshift({ id: current.id, title: current.title });
      if (!current.parent) break;
      current = categories.find((c) => c.id === current!.parent);
    }

    return [...path, ...items];
  };

  // When nothing is selected, show root's direct children
  const parentToMatch =
    selectedCategory === null || selectedCategory === rootId
      ? rootId
      : selectedCategory;

  const childCategories = categories.filter((c) => c.parent === parentToMatch);

  const breadcrumbPath = getBreadcrumbPath(selectedCategory);
  const hasChildren = childCategories.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        {breadcrumbPath.map((item, index) => (
          <div key={item.id ?? 'root'} className="flex items-center">
            <button
              onClick={() => onSelectCategory(item.id)}
              className={`text-sm py-0.5 px-1 rounded transition ${
                selectedCategory === item.id ||
                (item.id === null && !selectedCategory)
                  ? 'font-semibold text-black bg-gray-100'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.title}
            </button>
            {index < breadcrumbPath.length - 1 && (
              <ChevronRight className="w-3 h-3 text-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {/* "All" option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm ${
            !selectedCategory
              ? 'bg-black text-white'
              : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700'
          }`}
        >
          <FolderOpen className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">All Categories</span>
        </button>

        {!hasChildren && selectedCategory !== null && (
          <p className="text-xs text-gray-400 italic px-3 pt-1">
            No subcategories
          </p>
        )}

        {childCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const hasSubcategories = categories.some(
            (c) => c.parent === category.id,
          );
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition border ${
                isSelected
                  ? 'bg-black text-white border-black'
                  : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {hasSubcategories ? (
                  <FolderOpen
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                ) : (
                  <Folder
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {category.title}
                  </p>
                  {category.description && (
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isSelected ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {category.description}
                    </p>
                  )}
                </div>
                {hasSubcategories && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
