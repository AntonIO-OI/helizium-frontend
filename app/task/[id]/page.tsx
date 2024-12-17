'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Task, User } from '@/app/types/search';
import { getSearchData, delay } from '@/app/utils/storage';
import { getUser } from '@/app/data/mockUsers';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import TaskDetail from '@/app/components/task/TaskDetail';
import { AlertCircle } from 'lucide-react';
import ChatModal from '@/app/components/ChatModal';

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = use(params);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      await delay(400);

      const taskId = parseInt(resolvedParams.id);
      const data = getSearchData();
      const foundTask = data.tasks.find((t) => t.id === taskId);

      if (foundTask) {
        setTask(foundTask);
        const taskAuthor = getUser(foundTask.authorId);
        if (taskAuthor) {
          setAuthor(taskAuthor);
        }
      }

      setIsLoading(false);
    };

    fetchTask();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-lg"></div>
            <div className="h-24 bg-white rounded-lg"></div>
            <div className="h-48 bg-white rounded-lg"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!task || !author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
            <p className="text-gray-600 mb-8">
              The task you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <a
              href="/search"
              className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Browse Tasks
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TaskDetail task={task} author={author} />
        </div>
      </main>
      <ChatModal />
      <Footer />
    </div>
  );
}
