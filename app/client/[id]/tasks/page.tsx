'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Task, User } from '@/app/types/search';
import { getSearchData, delay } from '@/app/utils/storage';
import { getUser } from '@/app/data/mockUsers';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import LoadingState from '@/app/components/search/LoadingState';
import TaskList from '@/app/components/task/TaskList';

const ITEMS_PER_PAGE = 10;

export default function ClientTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const [client, setClient] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isClientChecked, setIsClientChecked] = useState(false);
  
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchClientTasks = async () => {
      const userId = parseInt(resolvedParams.id);
      const foundClient = getUser(userId);
      setClient(foundClient || null);
      setIsClientChecked(true);

      if (foundClient) {
        setIsLoading(true);
        await delay(400);
        
        const { tasks } = getSearchData();
        const clientTasks = tasks.filter(t => t.authorId === userId);
        setTasks(clientTasks);
        setTotalPages(Math.ceil(clientTasks.length / ITEMS_PER_PAGE));
        setIsLoading(false);
      }
    };

    fetchClientTasks();
  }, [resolvedParams.id]);

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

  if (isClientChecked && !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
            <p className="text-gray-600 mb-8">The client profile you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/recent" className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
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
          <div className="mb-8">
            <Link
              href={`/client/${resolvedParams.id}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to profile
            </Link>
            
            {client && (
              <div className="flex justify-between items-center mt-4">
                <h1 className="text-2xl font-bold">Tasks by {client.username}</h1>
                <span className="text-gray-500">
                  {tasks.length} tasks
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="mb-8">
                <TaskList tasks={paginatedTasks} />
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 