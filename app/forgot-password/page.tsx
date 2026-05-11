'use client';

import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import Captcha, { CaptchaRef } from '../components/Captcha';
import Link from 'next/link';
import { authApi } from '../lib/api/auth';

export default function RequestResetPassword() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const captchaRef = useRef<CaptchaRef>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const router = useRouter();

  const validateEmail = (v: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? null
      : 'Please enter a valid email address';
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateEmail(email)) {
      setToast({ message: 'Please enter a valid email', type: 'error' });
      return;
    }

    const captchaId = captchaRef.current?.getCaptchaId();
    const captchaValue = captchaRef.current?.getCaptchaValue();

    if (!captchaId || !captchaValue) {
      setToast({ message: 'Please complete the captcha', type: 'error' });
      return;
    }

    setIsLoading(true);
    const res = await authApi.lostPasswordSendEmail(email, {
      id: captchaId,
      value: captchaValue,
    });
    setIsLoading(false);

    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      captchaRef.current?.refreshCaptcha();
      return;
    }

    setToast({ message: 'Reset link sent to your email', type: 'success' });
    setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode || !userId) {
      setToast({
        message: 'Enter the code and user ID from the email',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    const res = await authApi.lostPasswordVerify(userId, emailCode);
    setIsLoading(false);

    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }

    router.push(`/reset-password?userId=${userId}&token=${emailCode}`);
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Recover access to your Helizium account."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequestCode}>
          <InputField
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            validate={validateEmail}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Captcha
            path="/auth/lost-password/send-email"
            method="POST"
            ref={captchaRef}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <p className="text-gray-600 mb-4 text-sm">
            Check your email. Enter the user ID and token from the link.
          </p>
          <InputField
            id="userId"
            type="text"
            label="User ID (from email link)"
            placeholder="24-character ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <InputField
            id="emailCode"
            type="text"
            label="Reset Token (from email link)"
            placeholder="Enter the token"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}

      <p className="text-center mt-4">
        Remember your password?{' '}
        <Link
          href="/login"
          className="text-black font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
