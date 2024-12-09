import { profileData } from '../data/mockProfile';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSection from '../components/profile/ProfileSection';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileInfo from '../components/ProfileInfo';
import ProfileActions from '../components/profile/ProfileActions';

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileSection>
            <ProfileHeader 
              username={profileData.username}
              email={profileData.email}
              isEmailConfirmed={profileData.isEmailConfirmed}
            />
            <ProfileStats stats={profileData.stats} />
            <ProfileActions />
          </ProfileSection>

          <ProfileSection>
            <ProfileInfo
              label="Bio"
              value={profileData.bio}
              isEditable={true}
            />
            <ProfileInfo
              label="Birthday"
              value={profileData.birthday}
              isEditable={true}
            />
          </ProfileSection>
        </div>
      </main>

      <Footer />
    </div>
  );
} 