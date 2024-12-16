import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
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

      <Captcha path='/auth/lost-password/send-email' method='POST' />

      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
      >
        Send Reset Link
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
