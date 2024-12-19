import { useState } from 'react';
import { Task, User, TaskStatus } from '@/app/types/search';
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
import { getUser } from '@/app/data/mockUsers';
import { applyForTask, rejectApplicant, approveApplicant, submitWorkResult, completeTask, rejectWorkResult } from '@/app/utils/taskManagement';

interface TaskDetailProps {
  task: Task;
  author: User;
  currentUser: User | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface ApplicantListProps {
  task: Task;
  currentUser: User | null;
  onReject: (userId: number) => void;
  onApprove: (userId: number) => void;
}

function ApplicantList({ task, currentUser, onReject, onApprove }: ApplicantListProps) {
  return (
    <div className="space-y-4">
      {task.applicants.map(userId => {
        const applicant = getUser(userId);
        if (!applicant) return null;

        return (
          <div key={userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {applicant.username[0]}
              </div>
              <div>
                <h3 className="font-medium">{applicant.username}</h3>
                <p className="text-sm text-gray-600">Rating: {applicant.rating}</p>
              </div>
            </div>
            
            {currentUser?.id === task.authorId && (
              <div className="flex gap-2">
                <button
                  onClick={() => onReject(userId)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(userId)}
                  className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TaskDetail({ task, author, currentUser }: TaskDetailProps) {
  const [currentTask, setCurrentTask] = useState(task);
  const [workResult, setWorkResult] = useState('');
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const { tasks } = getSearchData();
  const authorTasks = tasks.filter(t => t.authorId === author.id).length;
  
  const relatedCategoryIds = [task.category, ...getChildCategoryIds(task.category)];
  
  const similarTasks = tasks
    .filter(t => 
      t.id !== task.id && 
      relatedCategoryIds.includes(t.category)
    )
    .slice(0, 4);

  const handleApply = () => {
    if (!currentUser) return;
    const updatedTask = applyForTask(task.id, currentUser.id);
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
  };

  const handleReject = (userId: number) => {
    const updatedTask = rejectApplicant(task.id, userId);
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
  };

  const handleApprove = (userId: number) => {
    const updatedTask = approveApplicant(task.id, userId);
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
  };

  const handleSubmitWork = () => {
    if (!currentUser || !workResult.trim()) return;
    const updatedTask = submitWorkResult(task.id, currentUser.id, workResult.trim());
    if (updatedTask) {
      setCurrentTask(updatedTask);
      setShowWorkForm(false);
      setWorkResult('');
    }
  };

  const handleCompleteTask = () => {
    if (!currentUser) return;
    const updatedTask = completeTask(task.id, currentUser.id);
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
  };

  const handleRejectWork = () => {
    if (!currentUser || !rejectionReason.trim()) return;
    const updatedTask = rejectWorkResult(task.id, currentUser.id, rejectionReason);
    if (updatedTask) {
      setCurrentTask(updatedTask);
      setShowRejectionForm(false);
      setRejectionReason('');
    }
  };

  const canApply = currentUser && 
    currentUser.id !== author.id && 
    !currentTask.applicants.includes(currentUser.id) &&
    !currentTask.rejectedApplicants.includes(currentUser.id) &&
    !currentTask.performerId &&
    currentTask.status === TaskStatus.SEARCHING;

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Applications</h2>
        
        {canApply ? (
          <button
            onClick={handleApply}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Apply for this task
          </button>
        ) : currentTask.applicants.length > 0 ? (
          <ApplicantList
            task={currentTask}
            currentUser={currentUser}
            onReject={handleReject}
            onApprove={handleApprove}
          />
        ) : (
          <p className="text-gray-500">No applications yet</p>
        )}
      </div>

      {currentTask.performerId === currentUser?.id && 
       currentTask.status === TaskStatus.IN_PROGRESS && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Work</h2>
          
          {currentTask.rejectionMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Client Feedback:</h3>
              <p className="text-red-700">{currentTask.rejectionMessage}</p>
            </div>
          )}

          {showWorkForm ? (
            <div className="space-y-4">
              <textarea
                value={workResult}
                onChange={(e) => setWorkResult(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg"
                placeholder="Describe your work result..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitWork}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Submit Work
                </button>
                <button
                  onClick={() => setShowWorkForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWorkForm(true)}
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Submit Work Result
            </button>
          )}
        </div>
      )}

      {currentTask.authorId === currentUser?.id && 
       currentTask.status === TaskStatus.WAITING_APPROVAL && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Work Submission</h2>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Submitted Work:</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{currentTask.workResult}</p>
          </div>
          
          {showRejectionForm ? (
            <div className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg"
                placeholder="Please explain why you're rejecting this work..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRejectWork}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={!rejectionReason.trim()}
                >
                  Reject Work
                </button>
                <button
                  onClick={() => setShowRejectionForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCompleteTask}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve and Complete Task
              </button>
              <button
                onClick={() => setShowRejectionForm(true)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Request Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 