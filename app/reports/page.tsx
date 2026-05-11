'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { reportsApi, Report } from '@/app/lib/api/reports';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { Check, X, ExternalLink } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/');
      return;
    }
    if (!authLoading && isAdmin) {
      reportsApi.getReports().then((res) => {
        setReports(res.data ?? []);
        setIsLoading(false);
      });
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleUpdate = async (
    reportId: string,
    status: 'resolved' | 'dismissed',
  ) => {
    const res = await reportsApi.updateReportStatus(reportId, status);
    if (res.data) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? res.data! : r)),
      );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Task Reports</h1>
          <div className="space-y-4">
            {reports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No reports found
              </div>
            )}
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      <Link
                        href={`/task/${report.taskId}`}
                        className="hover:text-blue-600 flex items-center gap-2"
                      >
                        {report.taskTitle}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reported by{' '}
                      <Link
                        href={`/client/${report.reporterId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {report.reporterUsername}
                      </Link>{' '}
                      on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{report.reason}</p>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(report.id, 'resolved')}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" /> Resolve
                    </button>
                    <button
                      onClick={() => handleUpdate(report.id, 'dismissed')}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
