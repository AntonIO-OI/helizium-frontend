'use client';

import { useEffect, useState } from 'react';
import { tasksApi } from '../../lib/api/tasks';

interface Stats {
  createdTopics: number;
  takenTasks: number;
  completedTasks: number;
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
      <p className="text-3xl font-bold text-black mb-2">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

export default function ProfileStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({
    createdTopics: 0,
    takenTasks: 0,
    completedTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadStats = async () => {
      const [createdRes, takenRes, completedRes] = await Promise.all([
        tasksApi.listTasks({ authorId: userId, limit: 1 }),
        tasksApi.listTasks({ performerId: userId, limit: 1 }),
        tasksApi.listTasks({
          performerId: userId,
          status: 'completed',
          limit: 1,
        }),
      ]);

      const createdTopics = createdRes.data?.total ?? 0;
      const takenTasks = takenRes.data?.total ?? 0;
      const completedTasks = completedRes.data?.total ?? 0;

      setStats({ createdTopics, takenTasks, completedTasks });
      setIsLoading(false);
    };

    loadStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatItem label="Created Topics" value={stats.createdTopics} />
      <StatItem label="Tasks Taken" value={stats.takenTasks} />
      <StatItem label="Completed Tasks" value={stats.completedTasks} />
    </div>
  );
}
