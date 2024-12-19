'use client';

import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { delay } from '../utils/storage';
import Toast from '../components/Toast';
import Captcha, { CaptchaRef } from '../components/Captcha';
import { User } from '../types/search';
import Link from 'next/link';

export default function RequestResetPassword() {
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [emailCode, setEmailCode] = useState('');
  const [randomCode, setRandomCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

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

  const captchaRef = useRef<CaptchaRef>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit random code
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailCodeSent) {
      setToast({
        message: 'You did not send the confirmation code',
        type: 'error',
      });
      return;
    }

    if (emailCodeSent && (!emailCode || emailCode !== randomCode)) {
      setToast({ message: 'Invalid email code', type: 'error' });
      return;
    }

    await delay(400);

    router.push(`/reset-password?email=${email}&token=${emailCode}`);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const captchaId = captchaRef.current?.getCaptchaId();
    const captchaAnswer = captchaRef.current?.getCaptchaValue();

    if (!email) {
      setToast({ message: 'Email field empty', type: 'error' });
      return;
    }

    if (!captchaId || !captchaAnswer) {
      setToast({ message: 'Please complete captcha', type: 'error' });
      return;
    }

    if (captchaAnswer.endsWith(' ')) {
      setToast({ message: 'Invalid captcha answer', type: 'error' });
      captchaRef.current?.refreshCaptcha();
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setEmailError(emailError);
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.find((user: User) => user.email === email);

    if (!userExists) {
      setToast({ message: 'User with email does not exists', type: 'error' });
      return;
    }

    setEmailError(null);

    const code = generateRandomCode();
    setRandomCode(code);

    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          template: 'reset-password.mail',
          context: {
            appName: 'Helizium',
            otp: code,
            username: userExists.username,
            url: `http://localhost:3001/reset-password?email=${email}&token=${code}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailCodeSent(true);
      setToast({ message: 'Email code sent successfully', type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Error sending email code', type: 'error' });
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Recover access to your Helizium account by resetting your password."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleCodeSubmit}>
        {!emailCodeSent ? (
          <>
            <InputField
              id="email"
              type="email"
              label="Email"
              placeholder="Enter Email"
              value={email}
              validate={validateEmail}
              error={emailError}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Captcha
              path="/auth/lost-password/send-email"
              method="POST"
              ref={captchaRef}
            />
            <div className="mb-4 sm:mb-6">
              <button
                type="button"
                onClick={handleRequestCode}
                className="w-full bg-black text-white text-white py-3 rounded-md hover:bg-gray-800 transition"
              >
                Send Email Code
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <InputField
                id="emailCode"
                type="text"
                placeholder="Enter Email Code"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white text-white py-3 rounded-md hover:bg-gray-800 transition"
            >
              Confirm code
            </button>
          </>
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
      </form>
    </AuthLayout>
  );
}
