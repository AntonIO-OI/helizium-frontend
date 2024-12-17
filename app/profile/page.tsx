"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSection from '../components/profile/ProfileSection';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileInfo from '../components/ProfileInfo';
import ProfileActions from '../components/profile/ProfileActions';
import { User } from '../types/search';

export default function Profile() {
  const [userData, setUserData] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: { id: number }) => user.id === +userId);

    if (user) {
      setUserData(user);
    } else {
      localStorage.removeItem('userId');
      router.push('/login');
    }
  }, [router]);

  const handleBioEdit = (newBio: string | undefined) => {
    if (userData) {
      const updatedUser = { ...userData, bio: newBio };
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((user: User) =>
        user.id === userData.id ? updatedUser : user
      );

      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUserData(updatedUser); // Update the state with the new bio
    }
  };

  if (!userData) {
    return <div></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileSection>
            <ProfileHeader 
              username={userData.username}
              email={userData.email}
              isEmailConfirmed={userData.emailConfirmed}
            />
            <ProfileStats stats={{completedTasks: 0, createdCategories: 0, createdTopics: 0}} />
            <ProfileActions />
          </ProfileSection>

          <ProfileSection>
            <ProfileInfo
              label="Bio"
              value={userData.bio || ''}
              isEditable={true}
              onDelete={() => handleBioEdit(undefined)}
              onEdit={handleBioEdit}
            />
          </ProfileSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
