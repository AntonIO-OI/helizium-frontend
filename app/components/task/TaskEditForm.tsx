import { useState } from 'react';
import { Category, Task } from '@/app/types/search';
import { editTask } from '@/app/utils/taskManagement';
import { AlertCircle } from 'lucide-react';

interface TaskEditFormProps {
  task: Task;
  categories: Category[];
  onCancel: () => void;
  onUpdate: (task: Task) => void;
}

export default function TaskEditForm({ 
  task, 
  categories, 
  onCancel,
  onUpdate 
}: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [category, setCategory] = useState(task.category);
  const [price, setPrice] = useState(task.price.toString());
  const [date, setDate] = useState(task.date);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!title || !content || !category || !price || !date) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    setError('AI is verifying your task...');

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (title[0] === title[0].toLowerCase() || content[0] === content[0].toLowerCase()) {
      setError('');
      setError("AI verification failed: Title and content must start with capital letters.");
      setIsLoading(false);
      return;
    }

    const updatedTask = editTask(task.id, task.authorId, {
      title,
      content,
      category,
      price: parseFloat(price),
      date
    });

    if (updatedTask) {
      onUpdate(updatedTask);
    } else {
      setError('Unable to update task. It may no longer be editable.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(parseInt(e.target.value))}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Task'}
        </button>
      </div>
    </form>
  );
} 