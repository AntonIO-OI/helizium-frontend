'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import { AlertCircle, X as XIcon } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';
import { useAuth } from '@/app/lib/hooks/useAuth';
import Toast from '@/app/components/Toast';

export default function CreateCategoryPage() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
  } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && !isAdmin) {
      setShowAdminModal(true);
      return;
    }
    if (!authLoading && isAdmin) {
      categoriesApi.getRoot().then((res) => {
        if (res.data) {
          setParentCategoryId(res.data.category.id);
          const all = [res.data.category, ...res.data.nestedCategories];
          setCategories(all);
        }
      });
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }

    const parent = categories.find((c) => c.id === parentCategoryId);
    if (!parent) {
      setError('Please select a valid parent category');
      return;
    }

    setIsSubmitting(true);
    const res = await categoriesApi.createCategory({
      title,
      description,
      parentLocation: parent.location,
      allowedTopicTypes: [
        'TAKE_AND_COMPLETE',
        'DISCUSSION',
        'BEST_WORK',
        'SELL_TO_SINGLE_PERSON',
        'SELL_FOR_MANY_PEOPLE',
      ],
      permissions: {
        categoriesGranted: [],
        categoriesRevoked: [],
        topicsGranted: [],
        topicsRevoked: [],
      },
    });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    setToast({ message: 'Category created!', type: 'success' });
    setTimeout(() => router.push('/categories/manage'), 1000);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Category</h1>
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
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Enter category title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Enter category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
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
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {showAdminModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Admin Access Required</h2>
              </div>
              <button onClick={() => router.push('/')}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">
              Only administrators can create categories.
            </p>
            <button
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => router.push('/')}
            >
              Go Back
            </button>
          </div>
        </div>
      )}
      <ChatModal />
    </div>
  );
}
