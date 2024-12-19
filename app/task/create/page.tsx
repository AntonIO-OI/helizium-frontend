'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Category } from '@/app/types/search';
import { getSearchData } from '@/app/utils/storage';
import TaskCreationForm from '@/app/components/task/TaskCreationForm';

export default function CreateTaskPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    setCurrentUser(parseInt(userId));

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
          <TaskCreationForm categories={categories} authorId={currentUser} />
        </div>
      </main>
      <Footer />
    </div>
  );
} 