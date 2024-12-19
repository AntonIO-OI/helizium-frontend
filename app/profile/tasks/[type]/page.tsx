'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Task, User } from '@/app/types/search';
import { getSearchData, delay } from '@/app/utils/storage';
import { useRouter } from 'next/navigation';
import TaskList from '@/app/components/task/TaskList';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const ITEMS_PER_PAGE = 10;

export default function TasksPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      await delay(400);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      const currentUserId = parseInt(userId);

      const { tasks: allTasks } = getSearchData();
      
      const filteredTasks = resolvedParams.type === 'created' 
        ? allTasks.filter(task => {
            return task.authorId === currentUserId;
          })
        : allTasks.filter(task => {
            return task.performerId === currentUserId;
          });

      const sortedTasks = [...filteredTasks].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );


      setTasks(sortedTasks);
      setTotalPages(Math.ceil(sortedTasks.length / ITEMS_PER_PAGE));
      setIsLoading(false);
    };

    fetchTasks();
  }, [resolvedParams.type, router]);

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    await delay(400);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to profile
          </Link>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {resolvedParams.type === 'created' ? 'Topics Created' : 'Topics Taken'}
            </h1>
            <span className="text-gray-500">
              {tasks.length} tasks
            </span>
          </div>

          <TaskList tasks={paginatedTasks} isLoading={isLoading} />

          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg border ${
                      currentPage === pageNum 
                        ? 'bg-black text-white' 
                        : 'bg-white hover:bg-gray-50'
                    } transition`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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