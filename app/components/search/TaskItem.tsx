import Link from 'next/link';
import { Task } from '../../lib/api/tasks';

interface TaskItemProps {
  task: Task;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching':
      return 'bg-blue-100   text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'waiting_approval':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100  text-green-800';
    case 'disputed':
      return 'bg-red-100    text-red-800';
    case 'cancelled':
      return 'bg-gray-100   text-gray-600';
    default:
      return 'bg-gray-100   text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'searching':
      return 'Searching Freelancer';
    case 'in_progress':
      return 'In Progress';
    case 'waiting_approval':
      return 'Waiting Approval';
    case 'completed':
      return 'Completed';
    case 'disputed':
      return 'Disputed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function TaskItem({ task }: TaskItemProps) {
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <Link href={`/task/${task.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1 flex-1 mr-2">
            {task.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{task.content}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Due: {dueDate}</span>
          <span className="font-semibold text-gray-800">
            {task.price} {task.currency || 'ETH'}
          </span>
        </div>
      </div>
    </Link>
  );
}
