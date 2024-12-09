import { ProfileData } from '@/app/types/profile';

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
  stats: ProfileData['stats'];
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatItem label="Created Topics" value={stats.createdTopics} />
      <StatItem label="Created Categories" value={stats.createdCategories} />
      <StatItem label="Completed Tasks" value={stats.completedTasks} />
    </div>
  );
} 