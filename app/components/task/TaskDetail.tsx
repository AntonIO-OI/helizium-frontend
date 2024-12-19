import { Task, User } from '@/app/types/search';
import { getChildCategoryIds } from '@/app/utils/categories';
import { getSearchData } from '@/app/utils/storage';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  ChevronRight,
  ListTodo
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TaskDetailProps {
  task: Task;
  author: User;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function TaskDetail({ task, author }: TaskDetailProps) {
  const { tasks } = getSearchData();
  const authorTasks = tasks.filter(t => t.authorId === author.id).length;
  
  const relatedCategoryIds = [task.category, ...getChildCategoryIds(task.category)];
  
  const similarTasks = tasks
    .filter(t => 
      t.id !== task.id && 
      relatedCategoryIds.includes(t.category)
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
          <span>Task #{task.id}</span>
          <ChevronRight className="w-4 h-4" />
          <span>Posted {formatDate(task.posted)}</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{task.title}</h1>
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-lg">{task.price}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>Due date: {formatDate(task.date)}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-600 text-lg leading-relaxed">{task.content}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <Link href={`/client/${author.id}`} className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-gray-800 transition">
                {author.avatar ? (
                  <Image src={author.avatar} alt={author.username} width={48} height={48} className="w-full h-full rounded-full object-cover" />
                ) : (
                  author.username[0]
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold group-hover:text-gray-600 transition">{author.username}</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Client
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{author.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Since {new Date(author.joinedDate).getFullYear()}</span>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            href={`/client/${author.id}/tasks`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ListTodo className="w-4 h-4" />
            <span>{authorTasks} tasks</span>
          </Link>
        </div>
      </div>

      {similarTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Similar Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarTasks.map((similarTask) => (
              <Link 
                href={`/task/${similarTask.id}`} 
                key={similarTask.id}
                className="p-4 border rounded-lg hover:shadow-md transition group"
              >
                <h3 className="font-semibold mb-2 group-hover:text-gray-600">
                  {similarTask.title}
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{similarTask.price}</span>
                  </div>
                  <span>{formatDate(similarTask.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 