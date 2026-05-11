'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { tasksApi, Task } from '@/app/lib/api/tasks';
import { useRouter } from 'next/navigation';
import TaskList from '@/app/components/task/TaskList';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/lib/hooks/useAuth';

const ITEMS_PER_PAGE = 10;

export default function TasksPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const resolvedParams = use(params);
  const { isLoading: authLoading, isAuthenticated, userId } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const params =
      resolvedParams.type === 'created'
        ? {
            authorId: userId,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            sortBy: 'postedAt',
            sortDir: 'desc' as const,
          }
        : {
            performerId: userId,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            sortBy: 'postedAt',
            sortDir: 'desc' as const,
          };

    tasksApi.listTasks(params).then((res) => {
      setTasks(res.data?.tasks ?? []);
      setTotal(res.data?.total ?? 0);
      setIsLoading(false);
    });
  }, [userId, resolvedParams.type, currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to profile
          </Link>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {resolvedParams.type === 'created'
                ? 'Topics Created'
                : 'Topics Taken'}
            </h1>
            <span className="text-gray-500">{total} tasks</span>
          </div>

          <TaskList tasks={tasks} isLoading={isLoading} />

          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-10 h-10 rounded-lg border ${currentPage === n ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'} transition`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
