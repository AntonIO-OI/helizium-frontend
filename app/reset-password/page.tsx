'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';

export default function ResetPassword() {
  return (
    <AuthLayout 
      title="Reset Password"
      description="Reset your password to regain access to your Helizium account."
    >
      <InputField
        label="New Password"
        type="password"
        id="newPassword"
        placeholder="Enter your new password"
        required
      />
      <InputField
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        placeholder="Confirm your new password"
        required
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
      >
        Set New Password
      </button>
      <p className="text-center mt-4">
        Remember your password?{" "}
        <Link href="/login" className="text-black font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
} 
