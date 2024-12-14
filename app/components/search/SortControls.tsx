import {
  ArrowUpDown,
  ArrowDown01,
  ArrowUp01,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from 'lucide-react';
import { SortConfig, SortField } from '@/app/types/search';

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (newSort: SortConfig) => void;
}

export default function SortControls({
  sortConfig,
  onSortChange,
}: SortControlsProps) {
  const toggleDirection = (field: SortField) => {
    if (sortConfig.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }

    switch (field) {
      case 'title':
        return sortConfig.direction === 'asc' ? (
          <ArrowDownAZ className="w-4 h-4" />
        ) : (
          <ArrowUpAZ className="w-4 h-4" />
        );
      case 'price':
        return sortConfig.direction === 'asc' ? (
          <ArrowDown01 className="w-4 h-4" />
        ) : (
          <ArrowUp01 className="w-4 h-4" />
        );
      case 'date':
        return sortConfig.direction === 'asc' ? (
          <ArrowDownWideNarrow className="w-4 h-4" />
        ) : (
          <ArrowUpWideNarrow className="w-4 h-4" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2">
      {[
        { field: 'title' as SortField, label: 'Title' },
        { field: 'date' as SortField, label: 'Date' },
        { field: 'price' as SortField, label: 'Price' },
      ].map(({ field, label }) => (
        <button
          key={field}
          onClick={() => toggleDirection(field)}
          className={`px-3 py-2 rounded-md border flex items-center gap-2 transition
            ${
              sortConfig.field === field
                ? 'bg-black text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
        >
          {label}
          {getSortIcon(field)}
        </button>
      ))}
    </div>
  );
}
