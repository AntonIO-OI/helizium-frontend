'use client';

import { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Star,
  Clock,
  ChevronRight,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Task, PublicUser, tasksApi } from '../../lib/api/tasks';
import { signTaskContract } from '../../utils/contractOperations';
import Toast from '../Toast';
import ReportButton from './ReportButton';

interface TaskDetailProps {
  task: Task;
  author: PublicUser;
  currentUser: PublicUser | null;
  onTaskUpdate: (task: Task) => void;
}

const statusColors: Record<string, string> = {
  searching: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_approval: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const statusText: Record<string, string> = {
  searching: 'Searching Freelancer',
  in_progress: 'In Progress',
  waiting_approval: 'Waiting Approval',
  completed: 'Completed',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

interface ApplicantRowProps {
  applicantId: string;
  onReject: (id: string) => void;
  onApprove: (id: string) => void;
  isLoading: boolean;
}

function ApplicantRow({
  applicantId,
  onReject,
  onApprove,
  isLoading,
}: ApplicantRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <Link
        href={`/client/${applicantId}`}
        className="text-blue-600 hover:underline font-mono text-sm"
      >
        {applicantId.slice(-8)}...
      </Link>
      <div className="flex gap-2">
        <button
          onClick={() => onReject(applicantId)}
          disabled={isLoading}
          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => onApprove(applicantId)}
          disabled={isLoading}
          className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 disabled:opacity-50"
        >
          Approve (Sign)
        </button>
      </div>
    </div>
  );
}

export default function TaskDetail({
  task,
  author,
  currentUser,
  onTaskUpdate,
}: TaskDetailProps) {
  const [workResult, setWorkResult] = useState('');
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthor = currentUser?.id === task.authorId;
  const isPerformer = currentUser?.id === task.performerId;
  const isAdmin = currentUser?.isAdmin;

  const canApply =
    currentUser &&
    !isAuthor &&
    !task.applicants.includes(currentUser.id) &&
    !task.rejectedApplicants.includes(currentUser.id) &&
    !task.performerId &&
    task.status === 'searching';

  const doAction = async (fn: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await fn();
    } catch (err: any) {
      setToast({ message: err?.message || 'Action failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () =>
    doAction(async () => {
      const res = await tasksApi.applyForTask(task.id);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
    });

  const handleReject = (applicantId: string) =>
    doAction(async () => {
      const res = await tasksApi.rejectApplicant(task.id, applicantId);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
    });

  const handleApprove = (applicantId: string) =>
    doAction(async () => {
      const contract = await signTaskContract('accept', 0, task.title);
      if (!contract.success)
        throw new Error(contract.error || 'Contract signing failed');
      const res = await tasksApi.approveApplicant(
        task.id,
        applicantId,
        contract.signature?.signature,
      );
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
    });

  const handleSubmitWork = () =>
    doAction(async () => {
      if (!workResult.trim()) throw new Error('Work result is required');
      const res = await tasksApi.submitWork(task.id, workResult.trim());
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowWorkForm(false);
      setWorkResult('');
    });

  const handleCompleteTask = () =>
    doAction(async () => {
      const contract = await signTaskContract('complete', 0, task.title);
      if (!contract.success)
        throw new Error(contract.error || 'Contract signing failed');
      const res = await tasksApi.completeTask(
        task.id,
        contract.signature?.signature,
      );
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowRatingModal(true);
    });

  const handleRejectWork = () =>
    doAction(async () => {
      if (!rejectionReason.trim())
        throw new Error('Please provide a rejection reason');
      const res = await tasksApi.rejectWork(task.id, rejectionReason.trim());
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowRejectionForm(false);
      setRejectionReason('');
    });

  const handleDeleteTask = () =>
    doAction(async () => {
      if (!window.confirm('Are you sure you want to delete this task?')) return;
      const contract = await signTaskContract('delete', 0, task.title);
      if (!contract.success)
        throw new Error(contract.error || 'Contract signing failed');
      const res = await tasksApi.deleteTask(task.id);
      if (res.error) throw new Error(res.error);
      window.location.href = '/recent';
    });

  const handleDiscardFreelancer = () =>
    doAction(async () => {
      if (
        !window.confirm(
          'Discard this freelancer? They will be removed from the task.',
        )
      )
        return;
      const contract = await signTaskContract('discard', 0, task.title);
      if (!contract.success)
        throw new Error(contract.error || 'Signing failed');
      const res = await tasksApi.discardFreelancer(task.id);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
    });

  const handleRatingSubmit = () =>
    doAction(async () => {
      if (rating === 0) {
        setShowRatingModal(false);
        return;
      }
      const res = await tasksApi.rateTask(task.id, rating);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowRatingModal(false);
      setToast({ message: 'Rating submitted!', type: 'success' });
    });

  const approvedPerformer = task.performer ?? null;

  return (
    <div className="space-y-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {/* Main Task Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Task #{task.id.slice(-8)}</span>
            <ChevronRight className="w-4 h-4" />
            <span>Posted {formatDate(task.postedAt)}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}
            >
              {statusText[task.status] || task.status}
            </span>
            {(isAuthor || isAdmin) && task.status === 'searching' && (
              <button
                onClick={handleDeleteTask}
                disabled={isLoading}
                className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 text-sm disabled:opacity-50"
              >
                Delete Task
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{task.title}</h1>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-lg">
              {task.price} {task.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 text-lg leading-relaxed">
            {task.content}
          </p>
        </div>

        {currentUser && !isAdmin && !isAuthor && !isPerformer && (
          <div className="border-t pt-4">
            <ReportButton
              taskId={task.id}
              isEmailConfirmed={true}
              isBanned={currentUser.isBanned}
              isLoggedIn={!!currentUser}
            />
          </div>
        )}
      </div>

      {/* Author */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <Link
          href={`/client/${author.id}`}
          className="flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-gray-800 transition">
            {author.username[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold group-hover:text-gray-600">
                {author.username}
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Client
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{author.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Since {new Date(author.joinedDate).getFullYear()}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Performer */}
      {approvedPerformer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Link
            href={`/client/${approvedPerformer.id}`}
            className="flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-gray-700 transition">
              {approvedPerformer.username[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{approvedPerformer.username}</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                  Freelancer
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{approvedPerformer.rating.toFixed(1)}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Admin: discard freelancer */}
      {isAdmin &&
        !isAuthor &&
        task.performerId &&
        task.status !== 'completed' && (
          <button
            onClick={handleDiscardFreelancer}
            disabled={isLoading}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Discard Freelancer (Admin)
          </button>
        )}

      {/* Applications */}
      {!task.performerId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Applications</h2>
          {canApply ? (
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              Apply for this task
            </button>
          ) : isAuthor && task.applicants.length > 0 ? (
            <div className="space-y-3">
              {task.applicants.map((applicantId) => (
                <ApplicantRow
                  key={applicantId}
                  applicantId={applicantId}
                  onReject={handleReject}
                  onApprove={handleApprove}
                  isLoading={isLoading}
                />
              ))}
            </div>
          ) : isAuthor ? (
            <p className="text-gray-500">No applications yet.</p>
          ) : task.status === 'searching' && currentUser && !canApply ? (
            <p className="text-gray-500 text-sm">
              You cannot apply for this task.
            </p>
          ) : null}
        </div>
      )}

      {/* Work result section */}
      {(task.workResult || task.rejectionMessage) &&
        (isAuthor || isPerformer || isAdmin) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Work Status</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}
              >
                {statusText[task.status]}
              </span>
            </div>

            {task.workResult && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Submitted Work:</h3>
                <textarea
                  value={task.workResult}
                  readOnly
                  className="w-full h-32 p-3 border rounded-lg bg-gray-50 cursor-default resize-none"
                />
              </div>
            )}

            {task.rejectionMessage && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-red-600">
                  Changes Requested:
                </h3>
                <textarea
                  value={task.rejectionMessage}
                  readOnly
                  className="w-full h-32 p-3 border border-red-200 rounded-lg bg-red-50 cursor-default resize-none"
                />
              </div>
            )}

            {isAuthor &&
              task.status === 'waiting_approval' &&
              (showRejectionForm ? (
                <div className="space-y-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-red-100"
                    placeholder="Explain what changes you need..."
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleRejectWork}
                      disabled={isLoading || !rejectionReason.trim()}
                      className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(false)}
                      className="w-full py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCompleteTask}
                    disabled={isLoading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve & Complete (Sign with MetaMask)
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Request Changes
                  </button>
                </div>
              ))}
          </div>
        )}

      {/* Submit Work (Performer) */}
      {isPerformer && task.status === 'in_progress' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Work</h2>
          {showWorkForm ? (
            <div className="space-y-4">
              <textarea
                value={workResult}
                onChange={(e) => setWorkResult(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Describe your completed work..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitWork}
                  disabled={isLoading || !workResult.trim()}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
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

      {/* Rejected notice */}
      {currentUser?.id && task.rejectedApplicants.includes(currentUser.id) && (
        <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <XCircle className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Application Rejected</h2>
          </div>
          <p className="text-gray-600">
            Your application was not accepted for this task.
          </p>
          <Link
            href="/recent"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4"
          >
            <ArrowRight className="w-4 h-4" />
            Browse other tasks
          </Link>
        </div>
      )}

      {/* Rating modal */}
      {showRatingModal && task.performerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-2">Rate the Freelancer</h2>
            <p className="text-gray-600 mb-6">
              How was the freelancer&apos;s work on this task?
            </p>
            <div className="flex justify-center space-x-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={rating === 0 || isLoading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating display */}
      {task.completed &&
        task.performerRating != null &&
        (isAuthor || isPerformer || isAdmin) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Task rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= task.performerRating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">
              {task.performerRating}/5
            </span>
          </div>
        )}
    </div>
  );
}
