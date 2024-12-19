'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import Toast from '../components/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '../types/search';
import { delay } from '../utils/storage';

const PASSWORD_VALIDATOR_MESSAGE =
  'Password must be 8-32 characters long. At least lowercase letter, uppercase letter and digit required';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;

function ResetPasswordContent() {
  const validatePassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      return PASSWORD_VALIDATOR_MESSAGE;
    }
    return null;
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: { id: number }) => user.id === +userId);

    if (user) {
      router.push('/profile');
    }
  }, [router]);

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }

    const passwordError2 = validatePassword(confirmPassword);
    if (passwordError2) {
      setConfirmPasswordError(password);
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        message: 'Password and confirm password are the same',
        type: 'error',
      });
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: User) => user.email === email);

    if (!user) {
      setToast({
        message: 'User not exists',
        type: 'error',
      });
      return;
    }

    if (user.password === password) {
      setToast({
        message: 'New password is the same as old',
        type: 'error',
      });
      return;
    }

    user.password = password;
    localStorage.setItem('users', JSON.stringify(users));

    await delay(400);

    router.push('/login');
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
          error={passwordError}
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
          error={confirmPasswordError}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
        >
          Set New Password
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
