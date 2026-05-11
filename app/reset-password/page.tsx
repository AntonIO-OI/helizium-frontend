'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import Toast from '../components/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../lib/api/auth';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;

function ResetPasswordContent() {
  const validatePassword = (v: string) =>
    PASSWORD_REGEX.test(v)
      ? null
      : 'Password must be 8-32 chars with uppercase, lowercase and digit';

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('token') || '';

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePassword(password)) {
      setToast({
        message: 'Password does not meet requirements',
        type: 'error',
      });
      return;
    }
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    const res = await authApi.lostPasswordChange(userId, token, password);
    setIsLoading(false);

    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }

    setToast({ message: 'Password changed successfully!', type: 'success' });
    setTimeout(() => router.push('/login'), 1500);
  };

  return (
    <AuthLayout
      title="Reset Password"
      description="Reset your password to regain access to your Helizium account."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleChangePassword}>
        <InputField
          label="New Password"
          type="password"
          id="newPassword"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          validate={validatePassword}
          required
        />
        <InputField
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          validate={validatePassword}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Set New Password'}
        </button>
      </form>
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
