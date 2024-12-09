import { LucideTrash2, LucidePencil } from 'lucide-react';

interface ProfileInfoProps {
  label: string;
  value: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export default function ProfileInfo({ label, value, isEditable = true }: ProfileInfoProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-700 font-semibold">{label}</h3>
        {isEditable && (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-1"
            >
              <LucidePencil className="w-4 h-4" /> Edit
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-1"
            >
              <LucideTrash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
      <div className="p-3 bg-white border rounded-md">{value}</div>
    </div>
  );
} 