import { LucideSearch, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onSearch, onClear }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search tasks (e.g., 'React', 'Design', 'API')..."
        className="w-full p-4 pr-24 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition"
      >
        <LucideSearch className="w-5 h-5" />
      </button>
    </form>
  );
} 