'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Task, User } from '@/app/types/search';
import { getUser } from '@/app/data/mockUsers';
import { getSearchData, delay } from '@/app/utils/storage';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
  Star,
  Award,
  Clock,
  MapPin,
  Mail,
  Briefcase,
  Calendar,
  ChevronRight,
  BanIcon,
} from 'lucide-react';
import Link from 'next/link';
import TaskList from '@/app/components/task/TaskList';
import ProfileButton from '@/app/components/profile/ProfileButton';
import ChatModal from '@/app/components/ChatModal';
import Toast from '@/app/components/Toast';

const PREVIEW_TASKS_COUNT = 3;

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [client, setClient] = useState<User | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState<User | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

  const resolvedParams = use(params);

  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      await delay(400);

      const userId = parseInt(resolvedParams.id);
      const foundClient = getUser(userId);
      const { tasks } = getSearchData();

      if (foundClient) {
        setClient(foundClient);
        setClientTasks(tasks.filter((t) => t.authorId === userId));
      }

      setIsLoading(false);

      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find(
        (user: { id: number }) => user.id === +currentUserId,
      );

      if (currentUser) {
        setUserData(currentUser);
      } else {
        localStorage.removeItem('userId');
      }
    };

    fetchClient();
  }, [resolvedParams.id]);

  const recentTasks = clientTasks
    .sort(
      (a: Task, b: Task) =>
        new Date(b.posted).getTime() - new Date(a.posted).getTime(),
    )
    .slice(0, PREVIEW_TASKS_COUNT);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-lg"></div>
            <div className="h-32 bg-white rounded-lg"></div>
            <div className="h-48 bg-white rounded-lg"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Client Not Found</h1>
            <p className="text-gray-600 mb-8">
              The client profile you&apos;re looking for doesn&apos;t exist.
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

  const banUserHandler = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to ban this user?',
    );
    if (!isConfirmed) {
      return;
    }

    const clientId = client.id;
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    const clientData = users.find((user) => user.id === clientId);
    if (!clientData) {
      setToast({ message: 'User not found', type: 'error' });
      return;
    }

    clientData.banned = true;
    localStorage.setItem('users', JSON.stringify(users));

    await delay(400);

    setClient(clientData);
    setToast({ message: 'User banned', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold">
                {client.username[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold">{client.username}</h1>
                  {client.banned && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-sm">
                      Banned
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">{client.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">
                      {clientTasks.length} Tasks Posted
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      Member since {new Date(client.joinedDate).getFullYear()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {client.bio || "This user hasn't added a bio yet."}
                </p>
                {userData?.admin && !client.admin && !client.banned ? (
                  <div className="mt-4">
                    <ProfileButton
                      label="Ban user"
                      variant="danger"
                      icon={BanIcon}
                      onClick={banUserHandler}
                    ></ProfileButton>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-6">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">
                    {client.location || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="font-medium">
                    {client.email || 'Not available'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Industry</div>
                  <div className="font-medium">
                    {client.industry || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Joined</div>
                  <div className="font-medium">
                    {new Date(client.joinedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Tasks */}
          {recentTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Tasks</h2>
                <Link
                  href={`/client/${client.id}/tasks`}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <span>View all {clientTasks.length} tasks</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <TaskList tasks={recentTasks} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>
      <ChatModal />
      <Footer />
    </div>
  );
}
