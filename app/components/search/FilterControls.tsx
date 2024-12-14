import { Calendar, X } from 'lucide-react';

interface FilterControlsProps {
  priceRange: [number, number];
  dateRange: [string, string];
  onPriceChange: (range: [number, number]) => void;
  onDateChange: (range: [string, string]) => void;
  onClearFilters: () => void;
}

export default function FilterControls({
  priceRange,
  dateRange,
  onPriceChange,
  onDateChange,
  onClearFilters
}: FilterControlsProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Filters</h2>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition"
        >
          <X className="w-4 h-4" />
          Clear filters
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Price Range</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                max="5000"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                placeholder="Min"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value) || 5000])}
                className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Date Range</h3>
        <div className="space-y-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange[0]}
              onChange={(e) => onDateChange([e.target.value, dateRange[1]])}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange[1]}
              onChange={(e) => onDateChange([dateRange[0], e.target.value])}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 