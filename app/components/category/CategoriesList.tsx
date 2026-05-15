import Link from 'next/link';
import { Category, ROOT_DISPLAY_NAME } from '@/app/lib/api/categories';
import { Folder, ChevronRight, Crown } from 'lucide-react';
import DeleteCategoryButton from './DeleteCategoryButton';

interface CategoriesListProps {
  categories: Category[];
  onCategoryDeleted: () => void;
}

export default function CategoriesList({
  categories,
  onCategoryDeleted,
}: CategoriesListProps) {
  // Root category is the one with no parent
  const rootCategory = categories.find(
    (c) => c.parent === null || c.parent === undefined,
  );
  const rootId = rootCategory?.id;

  // Show root's immediate children at the top level
  const topLevelCategories = categories.filter(
    (c) => c.parent === rootId && c.id !== rootId,
  );

  const renderCategory = (category: Category, level: number = 0) => {
    const children = categories.filter((c) => c.parent === category.id);
    const isRoot = category.id === rootId;

    return (
      <div key={category.id} className="space-y-1.5">
        <div
          className={`flex items-center justify-between p-4 bg-white rounded-lg border ${
            isRoot ? 'border-purple-200 bg-purple-50' : 'border-gray-100'
          } ${level > 0 ? 'ml-8' : ''}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isRoot ? (
              <Crown className="w-5 h-5 text-purple-500 flex-shrink-0" />
            ) : (
              <Folder className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <Link
                href={`/category/${category.id}`}
                className="font-semibold hover:text-blue-600 flex items-center gap-2 text-sm"
              >
                {isRoot ? ROOT_DISPLAY_NAME : category.title}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {category.description && (
                <p className="text-xs text-gray-500 truncate">
                  {category.description}
                </p>
              )}
              {isRoot && (
                <p className="text-xs text-purple-500 font-medium mt-0.5">
                  Platform root — cannot be deleted
                </p>
              )}
            </div>
          </div>
          {!isRoot && (
            <DeleteCategoryButton
              categoryId={category.id}
              isRootCategory={false}
              onDelete={onCategoryDeleted}
            />
          )}
        </div>
        {children.length > 0 && (
          <div className="space-y-1.5">
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {rootCategory && renderCategory(rootCategory, 0)}
      {!rootCategory && topLevelCategories.length === 0 && (
        <p className="text-gray-500 text-center py-8">No categories found.</p>
      )}
      {!rootCategory && topLevelCategories.map((cat) => renderCategory(cat))}
    </div>
  );
}
