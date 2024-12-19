import { Task } from '@/app/types/search';
import TaskItem from '@/app/components/search/TaskItem';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
}

export default function TaskList({ tasks, isLoading = false }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
} 