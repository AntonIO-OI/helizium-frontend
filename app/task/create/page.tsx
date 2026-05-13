'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { AlertCircle, X as XIcon, Loader2 } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import { tasksApi } from '@/app/lib/api/tasks';
import {
  signTaskContract,
  fundTaskOnChain,
} from '@/app/utils/contractOperations';

export default function CreateTaskPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isBanned, isEmailConfirmed } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
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
    categoriesApi.listAllCategories().then(setCategories);
  }, [isLoading, isAuthenticated, isBanned, isEmailConfirmed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (isBanned || !isEmailConfirmed) {
      setError('You are not allowed to create tasks at this time.');
      return;
    }
    if (!title || !content || !categoryId || !price || !dueDate) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    // 1. Sign a message as proof of intent (no gas).
    const contractResult = await signTaskContract('create', 0, title);
    if (!contractResult.success) {
      setError(contractResult.error || 'MetaMask signing failed.');
      setIsSubmitting(false);
      return;
    }

    // 2. Create the task in the backend → we get a task ID.
    const res = await tasksApi.createTask({
      title,
      content,
      categoryId,
      price: parseFloat(price),
      dueDate,
      contractTxHash: contractResult.signature?.signature,
    });

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    const task = res.data!;

    // 3. Fund the task on-chain (optional — only if price > 0).
    if (parseFloat(price) > 0) {
      setInfoMsg('Locking escrow funds on-chain via MetaMask…');
      const onChain = await fundTaskOnChain(task.id, price);

      if (!('error' in onChain)) {
        // Update the task with the real tx hash.
        await tasksApi.editTask(task.id, { contractTxHash: onChain.txHash });
        setInfoMsg('');
      } else {
        setInfoMsg('');
        // Non-fatal: task exists, but on-chain funding was skipped or rejected.
        const msg = `Task created (ID: …${task.id.slice(-8)}), but on-chain escrow funding failed: ${onChain.error}. You can fund the escrow contract manually later.`;
        setError(msg);
        setTimeout(() => router.push(`/task/${task.id}`), 5000);
        return;
      }
    }

    setIsSubmitting(false);
    router.push(`/task/${task.id}`);
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
              <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {infoMsg && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
                <span>{infoMsg}</span>
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
                <p className="text-xs text-gray-400 mt-1">
                  Funds are locked in the smart contract escrow until task
                  completion.
                </p>
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
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting
                  ? 'Creating…'
                  : 'Create Task (Sign & Fund via MetaMask)'}
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
              className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
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
