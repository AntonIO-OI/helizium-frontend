'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getSearchData } from '@/app/utils/storage';
import { getUser } from '@/app/data/mockUsers';
import CategoryHeader from '@/app/components/category/CategoryHeader';
import TaskList from '@/app/components/task/TaskList';
import { User, Task, Category } from '@/app/types/search';
import { use } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUser(getUser(Number(userId)));
    }

    const { categories, tasks } = getSearchData();
    const category = categories.find(c => c.id === parseInt(resolvedParams.id));
    if (!category) {
      router.push('/404');
      return;
    }

    setCategory(category);
    setTasks(tasks.filter(t => t.category === category.id));
  }, [resolvedParams.id, router]);

  if (!category) return null;

  const handleCategoryDeleted = () => {
    router.push('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CategoryHeader
            category={category}
            currentUser={currentUser || null}
            onCategoryDeleted={handleCategoryDeleted}
          />
          <TaskList tasks={tasks} isLoading={false} />
        </div>
      </main>
      <Footer />
    </div>
  );
} 