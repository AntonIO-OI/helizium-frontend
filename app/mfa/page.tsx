'use client';

import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import { authApi } from '../lib/api/auth';

export default function MFA() {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchMfaInfo = async () => {
      const infoRes = await authApi.info();
      if (infoRes.error || !infoRes.data) {
        router.push('/login');
        return;
      }

      const limits = infoRes.data.limits;
      if (limits !== 'MFA_REQUIRED') {
        router.push('/profile');
        return;
      }

      setUserId(infoRes.data.userId);

      const mfaRes = await authApi.getMfa();
      if (mfaRes.data) {
        setTotpEnabled(mfaRes.data.methods.includes('TOTP'));
      }
    };
    fetchMfaInfo();
  }, [router]);

  const handleSendEmailCode = async () => {
    setIsLoading(true);
    const res = await authApi.sendEmailMfaCode();
    setIsLoading(false);

    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setEmailCodeSent(true);
    setToast({ message: 'Email code sent', type: 'success' });
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (emailCodeSent && emailCode) {
      const res = await authApi.confirmEmailMfaCode(userId, emailCode);
      setIsLoading(false);
      if (res.error) {
        setToast({ message: res.error, type: 'error' });
        return;
      }
      router.push('/profile');
      return;
    }

    if (totpEnabled && totpCode) {
      const res = await authApi.confirmTotp(totpCode);
      setIsLoading(false);
      if (res.error) {
        setToast({ message: res.error, type: 'error' });
        return;
      }
      router.push('/profile');
      return;
    }

    setIsLoading(false);
    setToast({ message: 'Please provide a verification code', type: 'error' });
  };

  return (
    <AuthLayout
      title="MFA Required"
      description="Pass MFA to sign in your Helizium account."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleMfaSubmit}>
        {!emailCodeSent ? (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleSendEmailCode}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Email Code'}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <InputField
              id="emailCode"
              type="text"
              placeholder="Enter 6-digit email code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
            />
          </div>
        )}

        {totpEnabled && (
          <>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            <div className="mb-6">
              <InputField
                id="totpCode"
                type="text"
                placeholder="Enter TOTP code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Confirm MFA'}
        </button>
      </form>
    </AuthLayout>
  );
}
