'use client';

import { useEffect, useState } from 'react';
import { Task } from '../types/search';
import { getSearchData, delay } from '../utils/storage';
import Header from '../components/Header';
import TaskItem from '../components/search/TaskItem';
import LoadingState from '../components/search/LoadingState';

const ITEMS_PER_PAGE = 10;

export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      await delay(600);
      const data = getSearchData();
      const sortedTasks = [...data.tasks].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTasks(sortedTasks);
      setTotalPages(Math.ceil(sortedTasks.length / ITEMS_PER_PAGE));
      setIsLoading(false);
    };

    fetchTasks();
  }, []);

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Recent Tasks</h1>
            <span className="text-gray-500">
              Showing {Math.min(currentPage * ITEMS_PER_PAGE, tasks.length)} of {tasks.length} tasks
            </span>
          </div>
          
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))
                ) : (
                  paginatedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                )}
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 