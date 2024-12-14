import { Category } from '@/app/types/search';

interface CategoryItemProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function CategoryItem({ category, isSelected, onClick }: CategoryItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition ${
        isSelected 
          ? 'bg-black text-white' 
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <h3 className="font-semibold mb-1">{category.title}</h3>
      <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
        {category.description}
      </p>
    </button>
  );
} 