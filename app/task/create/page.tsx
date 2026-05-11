'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { AlertCircle, X as XIcon } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import { tasksApi } from '@/app/lib/api/tasks';
import { signTaskContract } from '@/app/utils/contractOperations';

export default function CreateTaskPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading, isAuthenticated, isBanned, isEmailConfirmed, limits } =
    useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isLoading) {
      if (isBanned) setShowBannedModal(true);
      if (!isEmailConfirmed) setShowEmailModal(true);
    }
    categoriesApi.listAllCategories().then((cats) => setCategories(cats));
  }, [isLoading, isAuthenticated, isBanned, isEmailConfirmed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBanned || !isEmailConfirmed) {
      setError('You are not allowed to create tasks at this time.');
      return;
    }

    if (!title || !content || !categoryId || !price || !dueDate) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    // Sign contract (MetaMask)
    let contractTxHash: string | undefined;
    try {
      const contractResult = await signTaskContract('create', 0, title);
      if (!contractResult.success) {
        setError(
          contractResult.error || 'Contract signing failed. Please try again.',
        );
        setIsSubmitting(false);
        return;
      }
      contractTxHash = contractResult.signature?.signature;
    } catch {
      setError('MetaMask interaction failed.');
      setIsSubmitting(false);
      return;
    }

    const res = await tasksApi.createTask({
      title,
      content,
      categoryId,
      price: parseFloat(price),
      dueDate,
      contractTxHash,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    router.push(`/task/${res.data!.id}`);
  };

  if (isLoading) return null;

  const disabled = isBanned || !isEmailConfirmed;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Task</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
          >
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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Describe your task requirements"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="">Select a category</option>
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
                  Budget (ETH)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">Ξ</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-black"
                    placeholder="0.05"
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
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
                disabled={isSubmitting || disabled}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Creating...'
                  : 'Create Task (Sign with MetaMask)'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {showBannedModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Account Banned</h2>
              </div>
              <button onClick={() => setShowBannedModal(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">
              You cannot create tasks while banned.
            </p>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Email Not Confirmed</h2>
              </div>
              <button onClick={() => setShowEmailModal(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">
              Please confirm your email before creating tasks.
            </p>
            <button
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              onClick={() => router.push('/profile')}
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}

      <ChatModal />
    </div>
  );
}
