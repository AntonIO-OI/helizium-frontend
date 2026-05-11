'use client';

import { useEffect, useState } from 'react';
import { tasksApi, Task } from '../lib/api/tasks';
import Header from '../components/Header';
import TaskList from '../components/task/TaskList';
import ChatModal from '../components/ChatModal';
import Footer from '../components/Footer';
import Link from 'next/link';
import { authApi } from '../lib/api/auth';

const ITEMS_PER_PAGE = 10;

export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    authApi.info().then((res) => setIsAuthorized(!res.error));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    tasksApi
      .listTasks({
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
  }, [currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Recent Tasks</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">{total} tasks</span>
              {isAuthorized && (
                <Link
                  href="/task/create"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Create Task
                </Link>
              )}
            </div>
          </div>

          <div className="mb-8">
            <TaskList tasks={tasks} isLoading={isLoading} />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-10 h-10 rounded-lg border ${
                    currentPage === n
                      ? 'bg-black text-white'
                      : 'bg-white hover:bg-gray-50'
                  } transition`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
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
      <ChatModal />
      <Footer />
    </div>
  );
}
