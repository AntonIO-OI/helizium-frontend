import Link from 'next/link';
import { Task, TaskStatus } from '@/app/types/search';

interface TaskItemProps {
  task: Task;
}

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.SEARCHING:
      return 'bg-blue-100 text-blue-800';
    case TaskStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800';
    case TaskStatus.WAITING_APPROVAL:
      return 'bg-purple-100 text-purple-800';
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
  }
};

export const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.SEARCHING:
      return 'Searching Freelancer';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.WAITING_APPROVAL:
      return 'Waiting Approval';
    case TaskStatus.COMPLETED:
      return 'Completed';
  }
};

export default function TaskItem({ task }: TaskItemProps) {
  return (
    <Link href={`/task/${task.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{task.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{task.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">{task.date}</span>
          <span className="font-semibold">${task.price}</span>
        </div>
      </div>
    </Link>
  );
} 