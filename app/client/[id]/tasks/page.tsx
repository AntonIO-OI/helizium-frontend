'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { tasksApi, Task, PublicUser } from '@/app/lib/api/tasks';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import LoadingState from '@/app/components/search/LoadingState';
import TaskList from '@/app/components/task/TaskList';
import { useAuth } from '@/app/lib/hooks/useAuth';

const ITEMS_PER_PAGE = 10;

export default function ClientTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { userId } = useAuth();
  const [client, setClient] = useState<PublicUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    tasksApi.getPublicUser(resolvedParams.id).then((res) => {
      if (!res.data) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      setClient(res.data);
    });
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!client) return;
    setIsLoading(true);
    tasksApi
      .listTasks({
        authorId: resolvedParams.id,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: 'postedAt',
        sortDir: 'desc',
      })
      .then((res) => {
        setTasks(res.data?.tasks ?? []);
        setTotal(res.data?.total ?? 0);
        setIsLoading(false);
      });
  }, [client, resolvedParams.id, currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
            <Link
              href="/recent"
              className="inline-block px-6 py-2 bg-black text-white rounded-lg"
            >
              Browse Tasks
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/client/${resolvedParams.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to profile
          </Link>

          {client && (
            <div className="flex justify-between items-center mt-4 mb-8">
              <h1 className="text-2xl font-bold">Tasks by {client.username}</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">{total} tasks</span>
                {userId === resolvedParams.id && (
                  <Link
                    href="/task/create"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Create Task
                  </Link>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <TaskList tasks={tasks} />
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`w-10 h-10 rounded-lg border ${currentPage === n ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'} transition`}
                      >
                        {n}
                      </button>
                    ),
                  )}
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
