'use client';

import { useState } from 'react';
import {
  Calendar, DollarSign, Star, Clock, ChevronRight, XCircle,
  ArrowRight, CheckCircle, AlertTriangle, ShieldAlert, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Task, PublicUser, tasksApi } from '../../lib/api/tasks';
import {
  signTaskContract,
  releasePaymentOnChain,
  cancelTaskOnChain,
  raiseDisputeOnChain,
  resolveDisputeOnChain,
  adminReleaseOnChain,
} from '../../utils/contractOperations';
import Toast from '../Toast';
import ReportButton from './ReportButton';
import { getStatusColor, getStatusText } from '../search/TaskItem';

interface TaskDetailProps {
  task:         Task;
  author:       PublicUser;
  currentUser:  PublicUser | null;
  onTaskUpdate: (task: Task) => void;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

interface ApplicantRowProps {
  applicantId: string;
  onReject:    (id: string) => void;
  onApprove:   (id: string) => void;
  isLoading:   boolean;
}

function ApplicantRow({ applicantId, onReject, onApprove, isLoading }: ApplicantRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <Link href={`/client/${applicantId}`} className="text-blue-600 hover:underline font-mono text-sm">
        {applicantId.slice(-8)}…
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
          Approve
        </button>
      </div>
    </div>
  );
}

export default function TaskDetail({ task, author, currentUser, onTaskUpdate }: TaskDetailProps) {
  const [workResult,        setWorkResult]        = useState('');
  const [showWorkForm,      setShowWorkForm]       = useState(false);
  const [rejectionReason,   setRejectionReason]   = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rating,            setRating]            = useState(0);
  const [showRatingModal,   setShowRatingModal]   = useState(false);
  const [isLoading,         setIsLoading]         = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | '' }>({
    message: '', type: '',
  });

  // Admin dispute resolution
  const [clientRecipient,     setClientRecipient]     = useState('');
  const [freelancerRecipient, setFreelancerRecipient] = useState('');

  const isAuthor    = currentUser?.id === task.authorId;
  const isPerformer = currentUser?.id === task.performerId;
  const isAdmin     = currentUser?.isAdmin;

  const canApply =
    currentUser &&
    !isAuthor &&
    !task.applicants.includes(currentUser.id) &&
    !task.rejectedApplicants.includes(currentUser.id) &&
    !task.performerId &&
    task.status === 'searching';

  const waitingForApprove =
    currentUser &&
    !isAuthor &&
    task.applicants.includes(currentUser.id) &&
    !task.rejectedApplicants.includes(currentUser.id) &&
    task.status === 'searching';

  const canRaiseDispute =
    currentUser &&
    (isAuthor || isPerformer || isAdmin) &&
    (task.status === 'in_progress' || task.status === 'waiting_approval');

  const canReport =
    !!currentUser &&
    !isAdmin &&
    !currentUser.isBanned &&
    task.status !== 'completed' &&
    task.status !== 'cancelled';

  const approvedPerformer = task.performer ?? null;

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

  // ─── task actions ────────────────────────────────────────────────────

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
      if (!contract.success) throw new Error(contract.error || 'Signing failed');
      const res = await tasksApi.approveApplicant(
        task.id, applicantId, contract.signature?.signature,
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
      const freelancerEthAddress = approvedPerformer?.ethAddress;
      if (!freelancerEthAddress) {
        throw new Error(
          'The freelancer has not connected their Ethereum wallet yet. ' +
          'Ask them to connect MetaMask in their profile before approving.',
        );
      }

      setToast({ message: 'Releasing escrow funds on-chain…', type: 'success' });
      const onChain = await releasePaymentOnChain(task.id, freelancerEthAddress);

      let contractTxHash: string | undefined;
      if (!('error' in onChain)) {
        contractTxHash = onChain.txHash;
        setToast({ message: '', type: '' });
      } else {
        setToast({ message: '', type: '' });
        // Non-fatal: contract may not be deployed. Log and continue.
        console.warn('On-chain release failed:', onChain.error);
      }

      const res = await tasksApi.completeTask(task.id, contractTxHash);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowRatingModal(true);
    });

  const handleRejectWork = () =>
    doAction(async () => {
      if (!rejectionReason.trim()) throw new Error('Please provide a rejection reason');
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
        throw new Error(contract.error || 'Signing failed');

      // Only attempt on-chain cancel if the task has a real tx hash (32 bytes = 66 chars).
      // A MetaMask signature stored at creation time is 132 chars — not a tx hash.
      const hasRealTxHash =
        task.contractTxHash &&
        task.contractTxHash.startsWith('0x') &&
        task.contractTxHash.length === 66;

      if (hasRealTxHash) {
        const onChain = await cancelTaskOnChain(task.id);
        if ('error' in onChain)
          console.warn('On-chain cancel skipped:', onChain.error);
      }

      const res = await tasksApi.deleteTask(task.id);
      if (res.error) throw new Error(res.error);
      window.location.href = '/recent';
    });

  const handleDiscardFreelancer = () =>
    doAction(async () => {
      if (!window.confirm('Discard this freelancer? They will be removed from the task.')) return;
      const res = await tasksApi.discardFreelancer(task.id);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
    });

  const handleRatingSubmit = () =>
    doAction(async () => {
      if (rating === 0) { setShowRatingModal(false); return; }
      const res = await tasksApi.rateTask(task.id, rating);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setShowRatingModal(false);
      setToast({ message: 'Rating submitted!', type: 'success' });
    });

  // ─── dispute actions ─────────────────────────────────────────────────

  const handleRaiseDispute = () =>
    doAction(async () => {
      if (!window.confirm(
        'Raise a dispute on this task? Funds will be frozen in escrow until resolved by an admin.',
      )) return;

      let contractTxHash: string | undefined;
      // Client (author) can freeze on-chain directly; performer cannot.
      if (isAuthor) {
        setToast({ message: 'Freezing escrow on-chain…', type: 'success' });
        const onChain = await raiseDisputeOnChain(task.id);
        if (!('error' in onChain)) {
          contractTxHash = onChain.txHash;
        } else {
          console.warn('On-chain dispute freeze skipped:', onChain.error);
        }
        setToast({ message: '', type: '' });
      }

      const res = await tasksApi.raiseDispute(task.id, contractTxHash);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setToast({
        message: isAuthor
          ? 'Dispute raised and funds frozen. An admin will review.'
          : 'Dispute request submitted. An admin will review and freeze funds.',
        type: 'success',
      });
    });

  const handleResolveDispute = (favorFreelancer: boolean) =>
    doAction(async () => {
      const recipientAddress = favorFreelancer
        ? (freelancerRecipient || approvedPerformer?.ethAddress || '')
        : (clientRecipient    || author.ethAddress || '');

      if (!recipientAddress) {
        throw new Error(
          `No ETH address available for the ${favorFreelancer ? 'freelancer' : 'client'}. ` +
          'Enter their address in the fields below.',
        );
      }

      setToast({ message: 'Resolving on-chain…', type: 'success' });
      const onChain = await resolveDisputeOnChain(task.id, recipientAddress);
      setToast({ message: '', type: '' });

      let contractTxHash: string | undefined;
      if (!('error' in onChain)) {
        contractTxHash = onChain.txHash;
      } else {
        const confirmed = window.confirm(
          `On-chain resolution failed: ${onChain.error}\n\n` +
          'Do you still want to update the backend status? ' +
          '(Funds may not have been released on-chain.)',
        );
        if (!confirmed) return;
      }

      const res = await tasksApi.resolveDispute(task.id, favorFreelancer, contractTxHash);
      if (res.error) throw new Error(res.error);
      onTaskUpdate(res.data!);
      setToast({
        message: `Dispute resolved in favour of the ${favorFreelancer ? 'freelancer' : 'client'}.`,
        type: 'success',
      });
    });

  const handleAdminEmergencyRelease = () =>
    doAction(async () => {
      const addr = window.prompt(
        'Emergency: enter the ETH address that should receive the escrow funds:',
      );
      if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        throw new Error('Invalid or missing ETH address');
      }
      const onChain = await adminReleaseOnChain(task.id, addr);
      if ('error' in onChain) throw new Error(onChain.error);
      setToast({
        message: `Emergency release executed. Tx: ${onChain.txHash.slice(0, 12)}…`,
        type: 'success',
      });
    });

  // ─── render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {/* ── Main card ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Task #{task.id.slice(-8)}</span>
            <ChevronRight className="w-4 h-4" />
            <span>Posted {formatDate(task.postedAt)}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
            >
              {getStatusText(task.status)}
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
          {task.contractTxHash && task.contractTxHash.startsWith('0x') && (
            <a
              href={`https://etherscan.io/tx/${task.contractTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline border border-blue-200 rounded-full px-2 py-1"
            >
              <CheckCircle className="w-3 h-3" /> On-chain verified
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <p className="text-gray-600 text-lg leading-relaxed">{task.content}</p>
      </div>

      {/* ── Author ── */}
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
            {author.ethAddress && (
              <p className="text-xs text-gray-400 font-mono mt-1">
                ETH: {author.ethAddress.slice(0, 6)}…
                {author.ethAddress.slice(-4)}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* ── Performer ── */}
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
              {approvedPerformer.ethAddress ? (
                <p className="text-xs text-gray-400 font-mono mt-1">
                  ETH: {approvedPerformer.ethAddress.slice(0, 6)}…
                  {approvedPerformer.ethAddress.slice(-4)}
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Freelancer has not set an ETH wallet address yet.
                </p>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* ── Admin: discard freelancer ── */}
      {isAdmin &&
        !isAuthor &&
        task.performerId &&
        task.status !== 'completed' &&
        task.status !== 'cancelled' && (
          <button
            onClick={handleDiscardFreelancer}
            disabled={isLoading}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Discard Freelancer (Admin)
          </button>
        )}

      {/* ── Disputed banner ── */}
      {task.status === 'disputed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
            <h2 className="text-lg font-bold text-red-700">
              Task is in Dispute
            </h2>
          </div>
          <p className="text-red-600 text-sm mb-4">
            The escrow funds for this task are frozen. A platform administrator
            will review the situation and release funds to the appropriate
            party.
          </p>

          {/* Admin resolution UI */}
          {isAdmin && (
            <div className="bg-white border border-red-200 rounded-lg p-5 mt-4 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Admin Dispute Resolution
              </h3>
              <p className="text-sm text-gray-500">
                Your MetaMask wallet must be the <strong>contract owner</strong>{' '}
                to release on-chain funds. After calling{' '}
                <code>resolveDispute</code> on-chain, the backend status will be
                updated automatically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Client ETH Address
                  </label>
                  <input
                    type="text"
                    placeholder={author.ethAddress || '0x…'}
                    value={clientRecipient}
                    onChange={(e) => setClientRecipient(e.target.value)}
                    className="w-full p-2 text-sm border rounded font-mono focus:ring-2 focus:ring-red-300"
                  />
                  {author.ethAddress && !clientRecipient && (
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                      Stored: {author.ethAddress}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Freelancer ETH Address
                  </label>
                  <input
                    type="text"
                    placeholder={approvedPerformer?.ethAddress || '0x…'}
                    value={freelancerRecipient}
                    onChange={(e) => setFreelancerRecipient(e.target.value)}
                    className="w-full p-2 text-sm border rounded font-mono focus:ring-2 focus:ring-red-300"
                  />
                  {approvedPerformer?.ethAddress && !freelancerRecipient && (
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                      Stored: {approvedPerformer.ethAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleResolveDispute(false)}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium"
                >
                  ✕ Release to Client (refund)
                </button>
                <button
                  onClick={() => handleResolveDispute(true)}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 text-sm font-medium"
                >
                  ✓ Release to Freelancer (pay)
                </button>
              </div>

              <div className="border-t pt-3">
                <button
                  onClick={handleAdminEmergencyRelease}
                  disabled={isLoading}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Emergency release (no fee, bypasses dispute state)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Applications ── */}
      {!task.performerId && task.status === 'searching' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Applications</h2>
          {canApply ? (
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              Apply for this Task
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
          ) : waitingForApprove ? (
            <p className="text-gray-500">Waiting for your approval...</p>
          ) : task.status === 'searching' && currentUser && !canApply ? (
            <p className="text-gray-500 text-sm">
              You cannot apply for this task.
            </p>
          ) : null}
        </div>
      )}

      {/* ── Work result / approval ── */}
      {(task.workResult || task.rejectionMessage) &&
        (isAuthor || isPerformer || isAdmin) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Work Status</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
              >
                {getStatusText(task.status)}
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
                    placeholder="Explain what changes you need…"
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
                    Approve &amp; Complete (releases escrow payment)
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

      {/* ── Submit work (performer) ── */}
      {isPerformer && task.status === 'in_progress' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Work</h2>
          {showWorkForm ? (
            <div className="space-y-4">
              <textarea
                value={workResult}
                onChange={(e) => setWorkResult(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Describe your completed work…"
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

      {/* ── Raise dispute ── */}
      {canRaiseDispute && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-700">Dispute</h2>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            If you believe there is an issue with this task, you can raise a
            dispute. An administrator will review and determine how the escrowed
            funds should be released.
            {isPerformer && !isAuthor && (
              <span className="block mt-1">
                As a freelancer, your dispute request will be reviewed by an
                admin who will then freeze the on-chain escrow on your behalf.
              </span>
            )}
          </p>
          <button
            onClick={handleRaiseDispute}
            disabled={isLoading}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Raise Dispute
          </button>
        </div>
      )}

      {/* ── Rejected notice ── */}
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

      {/* ── Report section ── */}
      {canReport && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-700">
              Report a Problem
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            If this task contains fraudulent content or violates our terms of
            service, please let our moderation team know.
          </p>
          <ReportButton
            taskId={task.id}
            isEmailConfirmed={true}
            isBanned={currentUser?.isBanned ?? false}
            isLoggedIn={!!currentUser}
          />
        </div>
      )}

      {/* ── Rating modal ── */}
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
                onClick={() => setShowRatingModal(false)}
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

      {/* ── Rating display ── */}
      {task.completed &&
        task.performerRating != null &&
        (isAuthor || isPerformer || isAdmin) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Task rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= task.performerRating!
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
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
