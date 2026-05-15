'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { tasksApi, Task, PublicUser } from '@/app/lib/api/tasks';
import { useAuth } from '@/app/lib/hooks/useAuth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
  Star,
  Award,
  Clock,
  MapPin,
  Briefcase,
  Calendar,
  ChevronRight,
  BanIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  ShieldOff,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import TaskList from '@/app/components/task/TaskList';
import ProfileButton from '@/app/components/profile/ProfileButton';
import ChatModal from '@/app/components/ChatModal';
import Toast from '@/app/components/Toast';
import PersonalChat from '@/app/components/PersonalChat';
import { usersApi } from '@/app/lib/api/users';
import { useRouter } from 'next/navigation';

const PREVIEW_TASKS_COUNT = 3;

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { userId, isAdmin, isBanned, isAuthenticated } = useAuth();
  const [client, setClient] = useState<PublicUser | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [userRes, tasksRes] = await Promise.all([
        tasksApi.getPublicUser(resolvedParams.id),
        tasksApi.listTasks({
          authorId: resolvedParams.id,
          limit: 100,
          sortBy: 'postedAt',
          sortDir: 'desc',
        }),
      ]);
      setClient(userRes.data ?? null);
      setClientTasks(tasksRes.data?.tasks ?? []);
      setTotalTasks(tasksRes.data?.total ?? 0);
      setIsLoading(false);
    };
    load();
  }, [resolvedParams.id]);

  const banUserHandler = async () => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    const res = await usersApi.banUser(resolvedParams.id);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setClient((c) => (c ? { ...c, isBanned: true } : c));
    setToast({ message: 'User banned successfully', type: 'success' });
  };

  const unbanUserHandler = async () => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    const res = await usersApi.unbanUser(resolvedParams.id);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setClient((c) => (c ? { ...c, isBanned: false } : c));
    setToast({ message: 'User unbanned successfully', type: 'success' });
  };

  const recentTasks = clientTasks.slice(0, PREVIEW_TASKS_COUNT);
  const canChat =
    isAuthenticated &&
    userId &&
    userId !== resolvedParams.id &&
    !isBanned &&
    !client?.isBanned;

  const isViewingOwnProfile = userId === resolvedParams.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-lg" />
            <div className="h-32 bg-white rounded-lg" />
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
            <h1 className="text-2xl font-bold mb-2">Client Not Found</h1>
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
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      {canChat && (
        <PersonalChat
          isVisible={showChat}
          onClose={() => setShowChat(false)}
          contactId={resolvedParams.id}
          contactUsername={client.username}
          readonly={false}
        />
      )}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
                {client.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h1 className="text-3xl font-bold">{client.username}</h1>
                  {client.isBanned && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Banned
                    </span>
                  )}
                  {client.isAdmin && !client.isBanned && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Admin
                    </span>
                  )}
                  {isViewingOwnProfile && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      You
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {client.rating.toFixed(1)} Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      {totalTasks} Tasks Posted
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Member since {new Date(client.joinedDate).getFullYear()}
                    </span>
                  </div>
                </div>
                {client.bio && (
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {client.bio}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Admin controls */}
                  {isAdmin && !isViewingOwnProfile && (
                    <>
                      {!client.isBanned && !client.isAdmin && (
                        <ProfileButton
                          label="Ban User"
                          variant="danger"
                          icon={BanIcon}
                          onClick={banUserHandler}
                        />
                      )}
                      {client.isBanned && (
                        <ProfileButton
                          label="Unban User"
                          variant="success"
                          icon={ShieldOff}
                          onClick={unbanUserHandler}
                        />
                      )}
                      <ProfileButton
                        label="Manage Permissions"
                        variant="secondary"
                        icon={Settings2}
                        onClick={() =>
                          router.push(
                            `/admin/permissions/${resolvedParams.id}`
                          )
                        }
                      />
                    </>
                  )}

                  {/* Chat button */}
                  {canChat && (
                    <ProfileButton
                      onClick={() => setShowChat(!showChat)}
                      label={showChat ? 'Close Chat' : 'Private Chat'}
                      variant="primary"
                      icon={
                        showChat ? MessageCircleOffIcon : MessageCircleIcon
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          {(client.location || client.industry) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-6">Client Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {client.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">{client.location}</div>
                    </div>
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Industry</div>
                      <div className="font-medium">{client.industry}</div>
                    </div>
                  </div>
                )}
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
          )}

          {/* Recent Tasks */}
          {recentTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Tasks</h2>
                <Link
                  href={`/client/${client.id}/tasks`}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm"
                >
                  <span>View all {totalTasks} tasks</span>
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
