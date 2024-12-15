import Link from 'next/link';
import { Task } from '@/app/types/search';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  return (
    <Link href={`/task/${task.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-bold text-lg mb-2">{task.title}</h3>
        <p className="text-gray-600 mb-4">{task.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">{task.date}</span>
          <span className="font-semibold">${task.price}</span>
        </div>
      </div>
    </Link>
  );
} 