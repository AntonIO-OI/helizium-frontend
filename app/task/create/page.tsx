'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Category, User } from '@/app/types/search';
import { getSearchData } from '@/app/utils/storage';
import TaskCreationForm from '@/app/components/task/TaskCreationForm';
import { AlertCircle, X as XIcon } from 'lucide-react';

export default function CreateTaskPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.banned === true) {
      setShowBannedModal(true);
    }

    if (user.emailConfirmed === false) {
      setShowEmailModal(true);
    }

    setCurrentUser(user);
    const { categories } = getSearchData();
    setCategories(categories);
  }, [router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Task</h1>
          <TaskCreationForm 
            categories={categories} 
            authorId={currentUser.id} 
            disabled={currentUser.banned || !currentUser.emailConfirmed}
          />
        </div>
      </main>
      <Footer />

      {showBannedModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Account Banned</h2>
              </div>
              <button onClick={() => setShowBannedModal(false)}>
                <XIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="text-gray-600">You cannot create tasks while your account is banned.</p>
            <button
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setShowBannedModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Email Not Confirmed</h2>
              </div>
              <button onClick={() => setShowEmailModal(false)}>
                <XIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="text-gray-600">Please confirm your email address before creating tasks.</p>
            <div className="flex space-x-4">
              <button
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                onClick={() => router.push('/profile')}
              >
                Confirm Email
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowEmailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 