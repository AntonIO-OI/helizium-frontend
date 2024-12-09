interface ProfileSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function ProfileSection({ children, className = '' }: ProfileSectionProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${className}`}>
      {children}
    </div>
  );
} 