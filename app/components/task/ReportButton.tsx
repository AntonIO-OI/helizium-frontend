import { useState } from 'react';
import { Flag, AlertCircle } from 'lucide-react';
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

  if (!isLoggedIn || !isEmailConfirmed || isBanned || reported) {
    if (reported) {
      return (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Flag className="w-4 h-4" /> Report submitted
        </div>
      );
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!reason.trim()) {
      setError('Please provide a reason');
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
        className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
      >
        <Flag className="w-4 h-4" /> Report
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Report Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
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
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-black"
                  placeholder="Please explain why you're reporting this task..."
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
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
