'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ForgotPassword() {
  const router = useRouter();

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

  return (
    <AuthLayout
      title="Forgot Password"
      description="Recover access to your Helizium account by resetting your password."
    >
      <InputField
        label="Email Address"
        type="email"
        id="email"
        placeholder="Enter your email address"
        required
      />

      <Captcha path="/auth/lost-password/send-email" method="POST" />

      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
      >
        Send Reset Link
      </button>
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
