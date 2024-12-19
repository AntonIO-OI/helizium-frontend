import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Task, TaskStatus } from '@/app/types/search';
import { getSearchData, saveTasks } from '@/app/utils/storage';
import { AlertCircle } from 'lucide-react';

interface TaskCreationFormProps {
  categories: Category[];
  authorId: number;
}

export default function TaskCreationForm({ categories, authorId }: TaskCreationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<number>(0);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAiError('');
    setIsLoading(true);

    if (!title || !content || !category || !price || !date) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Show loading state
    setError('AI is verifying your task...');

    // Simulate AI verification with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (title[0] === title[0].toLowerCase() || content[0] === content[0].toLowerCase()) {
      setError('');
      setAiError("AI verification failed, please contact the assistant for further assistance.");
      setIsLoading(false);
      return;
    }

    const { tasks } = getSearchData();
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title,
      content,
      category,
      price: parseFloat(price),
      date,
      posted: new Date().toISOString().split('T')[0],
      authorId,
      applicants: [],
      rejectedApplicants: [],
      performerId: null,
      workResult: null,
      completed: false,
      status: TaskStatus.SEARCHING,
      rejectionMessage: '',
    };

    saveTasks([...tasks, newTask]);
    router.push(`/task/${newTask.id}`);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {aiError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{aiError}</span>
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
          placeholder="Enter task title"
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
          placeholder="Describe your task requirements"
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
          <option value={0}>Select a category</option>
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
              placeholder="Enter budget"
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
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 