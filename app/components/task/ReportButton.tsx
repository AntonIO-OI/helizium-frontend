import { useState } from 'react';
import { Flag, AlertCircle, X } from 'lucide-react';
import { reportsApi } from '@/app/lib/api/reports';

interface ReportButtonProps {
  taskId: string;
  isEmailConfirmed: boolean;
  isBanned: boolean;
  isLoggedIn: boolean;
}

export default function ReportButton({
  taskId,
  isEmailConfirmed,
  isBanned,
  isLoggedIn,
}: ReportButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reported, setReported] = useState(false);

  if (reported) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
        <Flag className="w-4 h-4" />
        Report submitted — thank you.
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="text-xs text-gray-400">
        <a href="/login" className="underline hover:text-gray-600">
          Sign in
        </a>{' '}
        to report this task.
      </p>
    );
  }

  if (!isEmailConfirmed || isBanned) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    setIsLoading(true);
    const res = await reportsApi.createReport(taskId, reason.trim());
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setReported(true);
    setShowForm(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
      >
        <Flag className="w-4 h-4" />
        Report this Task
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <Flag className="w-5 h-5" /> Report Task
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Describe the issue with this task. Our moderation team will review
              your report.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
                  placeholder="Explain why you are reporting this task (e.g. scam, inappropriate content, duplicate)…"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !reason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    'Submitting…'
                  ) : (
                    <>
                      <Flag className="w-4 h-4" /> Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
