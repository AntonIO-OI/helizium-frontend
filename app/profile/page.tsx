'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSection from '../components/profile/ProfileSection';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileInfo from '../components/ProfileInfo';
import ProfileActions from '../components/profile/ProfileActions';
import ChatModal from '../components/ChatModal';
import WalletSection from '../components/profile/WalletSection';
import ChatHistory from '../components/ChatHistory';
import { FolderCog, Shield } from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { usersApi } from '../lib/api/users';

export default function Profile() {
  const router = useRouter();
  const {
    isLoading,
    isAuthenticated,
    user,
    userId,
    isAdmin,
    isBanned,
    isEmailConfirmed,
    limits,
    refresh,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleBioEdit = useCallback(
    async (newBio: string) => {
      await usersApi.updateBio(newBio);
      await refresh();
    },
    [refresh],
  );

  const handleBioDelete = useCallback(async () => {
    await usersApi.updateBio('');
    await refresh();
  }, [refresh]);

  const handleLocationEdit = useCallback(
    async (location: string) => {
      await usersApi.updateLocation(location);
      await refresh();
    },
    [refresh],
  );

  const handleLocationDelete = useCallback(async () => {
    await usersApi.updateLocation('');
    await refresh();
  }, [refresh]);

  const handleIndustryEdit = useCallback(
    async (industry: string) => {
      await usersApi.updateIndustry(industry);
      await refresh();
    },
    [refresh],
  );

  const handleIndustryDelete = useCallback(async () => {
    await usersApi.updateIndustry('');
    await refresh();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !userId) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileSection>
            <ProfileHeader
              username={user.username}
              email={user.email}
              isEmailConfirmed={isEmailConfirmed}
              isAdmin={isAdmin}
              isBanned={isBanned}
            />
            <ProfileStats userId={userId} />
            <ProfileActions
              userId={userId}
              limits={limits}
              isEmailConfirmed={isEmailConfirmed}
              isBanned={isBanned}
              onLogout={() => router.push('/')}
              onRefresh={refresh}
            />
          </ProfileSection>

          <ProfileSection>
            <ProfileInfo
              label="Bio"
              value={user.bio || ''}
              isEditable
              onDelete={handleBioDelete}
              onEdit={handleBioEdit}
            />
            <ProfileInfo
              label="Location"
              value={(user as any).location || ''}
              isEditable
              onDelete={handleLocationDelete}
              onEdit={handleLocationEdit}
            />
            <ProfileInfo
              label="Industry"
              value={(user as any).industry || ''}
              isEditable
              onDelete={handleIndustryDelete}
              onEdit={handleIndustryEdit}
            />
          </ProfileSection>

          {!isBanned && <ChatHistory userId={userId} />}

          <ProfileSection>
            <WalletSection />
          </ProfileSection>

          {isAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">Admin Tools</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/reports')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  View Reports
                </button>
                <button
                  onClick={() => router.push('/categories/manage')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FolderCog className="w-4 h-4" />
                  Manage Categories
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <ChatModal />
      <Footer />
    </div>
  );
}
