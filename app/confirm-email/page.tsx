'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../lib/api/auth';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const code = searchParams.get('code') || '';
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>(
    'confirming',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId || !code) {
      // No params — just redirect to profile (legacy redirect)
      router.push('/profile');
      return;
    }

    const confirm = async () => {
      const res = await authApi.confirmEmailMfaCode(userId, code);
      if (res.error) {
        setStatus('error');
        setMessage(res.error);
        return;
      }
      setStatus('success');
      setTimeout(() => router.push('/profile'), 2000);
    };

    confirm();
  }, [userId, code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
        {status === 'confirming' && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h1 className="text-xl font-bold">Confirming your email...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-green-600">
              Email Confirmed!
            </h1>
            <p className="text-gray-600 mt-2">Redirecting to your profile...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✗
            </div>
            <h1 className="text-xl font-bold text-red-600">
              Confirmation Failed
            </h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => router.push('/profile')}
              className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Go to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
