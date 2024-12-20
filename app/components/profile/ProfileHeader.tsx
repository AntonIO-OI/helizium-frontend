import ProfileAvatar from './ProfileAvatar';

interface ProfileHeaderProps {
  username: string;
  email: string;
  isEmailConfirmed: boolean;
  isAdmin: boolean;
}

export default function ProfileHeader({
  username,
  email,
  isEmailConfirmed,
  isAdmin,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <ProfileAvatar initial={username[0]} size="lg" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {username}
          {isAdmin && (
            <span className="px-2 mx-2 py-0.5 bg-red-100 text-red-800 rounded-full text-sm">
              Admin
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{email}</span>
          {!isEmailConfirmed && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              not confirmed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
