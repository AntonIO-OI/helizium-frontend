import Link from 'next/link';
import { Category } from '@/app/types/search';
import { Folder, ChevronRight } from 'lucide-react';
import DeleteCategoryButton from './DeleteCategoryButton';

interface CategoriesListProps {
  categories: Category[];
  onCategoryDeleted: () => void;
}

export default function CategoriesList({ categories, onCategoryDeleted }: CategoriesListProps) {
  const rootCategories = categories.filter(c => c.parentCategory === null);
  
  const renderCategory = (category: Category, level: number = 0) => {
    const children = categories.filter(c => c.parentCategory === category.id);
    
    return (
      <div key={category.id} className="space-y-2">
        <div className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 ${level > 0 ? 'ml-6' : ''}`}>
          <div className="flex items-center gap-4">
            <Folder className="w-5 h-5 text-gray-400" />
            <div>
              <Link 
                href={`/category/${category.id}`}
                className="font-semibold hover:text-blue-600 flex items-center gap-2"
              >
                {category.title}
                <ChevronRight className="w-4 h-4" />
              </Link>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
          <DeleteCategoryButton
            categoryId={category.id}
            isRootCategory={category.parentCategory === null}
            onDelete={onCategoryDeleted}
          />
        </div>
        {children.length > 0 && (
          <div className="space-y-2">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {rootCategories.map(category => renderCategory(category))}
    </div>
  );
} 