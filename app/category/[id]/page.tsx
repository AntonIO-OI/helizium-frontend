'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import { tasksApi, Task } from '@/app/lib/api/tasks';
import CategoryHeader from '@/app/components/category/CategoryHeader';
import TaskList from '@/app/components/task/TaskList';
import { use } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { userId, isAdmin } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const [catRes, tasksRes] = await Promise.all([
        categoriesApi.getCategoryInfo(resolvedParams.id),
        tasksApi.listTasks({ categoryId: resolvedParams.id, limit: 50 }),
      ]);
      if (!catRes.data) {
        router.push('/404');
        return;
      }
      setCategory(catRes.data);
      setTasks(tasksRes.data?.tasks ?? []);
      setIsLoading(false);
    };
    load();
  }, [resolvedParams.id, router]);

  if (isLoading || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse h-64 bg-white rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  const currentUserForHeader =
    userId && isAdmin ? { id: userId, isAdmin: true } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CategoryHeader
            category={category}
            currentUser={currentUserForHeader}
            onCategoryDeleted={() => router.push('/categories/manage')}
            onCategoryUpdated={(updated) => setCategory(updated)}
          />
          <div className="mt-8">
            <TaskList tasks={tasks} isLoading={false} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
