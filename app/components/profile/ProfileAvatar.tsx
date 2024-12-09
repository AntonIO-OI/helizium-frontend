interface ProfileAvatarProps {
  initial: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfileAvatar({ initial, size = 'md' }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} bg-black rounded-full flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  );
} 