import { useEffect, useState } from 'react';
import { UserStats, calculateUserStats } from '@/app/utils/stats';

interface StatItemProps {
  label: string;
  value: number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
      <p className="text-3xl font-bold text-black mb-2">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

interface ProfileStatsProps {
  userId: number;
}

export default function ProfileStats({ userId }: ProfileStatsProps) {
  const [stats, setStats] = useState<UserStats>({
    createdTopics: 0,
    createdCategories: 0,
    completedTasks: 0
  });

  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        const userStats = calculateUserStats(parseInt(storedUserId));
        setStats(userStats);
      }
      return;
    }

    const userStats = calculateUserStats(userId);
    setStats(userStats);
  }, [userId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatItem label="Created Topics" value={stats.createdTopics} />
      <StatItem label="Created Categories" value={stats.createdCategories} />
      <StatItem label="Completed Tasks" value={stats.completedTasks} />
    </div>
  );
} 