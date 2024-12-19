import { useState } from 'react';
import { LucideTrash2, LucidePencil } from 'lucide-react';

interface ProfileInfoProps {
  label: string;
  value: string;
  onEdit?: (newValue: string) => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export default function ProfileInfo({
  label,
  value,
  onEdit,
  onDelete,
  isEditable = true,
}: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(inputValue);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    setInputValue('');
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-700 font-semibold">{label}</h3>
        {isEditable && (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-1"
              onClick={() => setIsEditing(true)}
            >
              <LucidePencil className="w-4 h-4" /> Edit
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-1 disabled:bg-red-200"
              onClick={handleDelete}
              disabled={Boolean(!inputValue)}
            >
              <LucideTrash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
      <div className="p-3 bg-white border rounded-md">
        {isEditing ? (
          <div>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              onClick={handleEdit}
            >
              Save
            </button>
          </div>
        ) : inputValue ? (
          <span>{inputValue}</span>
        ) : (
          <span className="text-slate-400">
            Not set. Press edit button to enter.
          </span>
        )}
      </div>
    </div>
  );
}
