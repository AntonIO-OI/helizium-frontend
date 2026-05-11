'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha, { CaptchaRef } from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import { authApi } from '../lib/api/auth';

const USERNAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{4,30}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const captchaRef = useRef<CaptchaRef>(null);
  const router = useRouter();

  const validateUsername = (v: string) =>
    USERNAME_REGEX.test(v)
      ? null
      : 'Username must be 4-30 characters, letters, digits, underscores';
  const validateEmail = (v: string) =>
    EMAIL_REGEX.test(v) ? null : 'Please enter a valid email address';
  const validatePassword = (v: string) =>
    PASSWORD_REGEX.test(v)
      ? null
      : 'Password must be 8-32 chars, include uppercase, lowercase, digit';

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (
      validateUsername(username) ||
      validateEmail(email) ||
      validatePassword(password)
    ) {
      setToast({ message: 'Please fix validation errors', type: 'error' });
      return;
    }

    const captchaId = captchaRef.current?.getCaptchaId();
    const captchaValue = captchaRef.current?.getCaptchaValue();

    if (!captchaId || !captchaValue) {
      setToast({ message: 'Please complete the captcha', type: 'error' });
      return;
    }

    setIsLoading(true);
    const res = await authApi.signUp(
      { username, email: email.toLowerCase(), password },
      { id: captchaId, value: captchaValue },
    );
    setIsLoading(false);

    if (res.error) {
      setServerError(res.error);
      captchaRef.current?.refreshCaptcha();
      return;
    }

    router.push('/profile');
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Join Helizium and unlock the potential of secure, blockchain-powered freelancing."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={signUp}>
        <InputField
          label="Username"
          type="text"
          id="username"
          placeholder="Enter your username"
          required
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setServerError(null);
          }}
          validate={validateUsername}
        />
        <InputField
          label="Email"
          type="email"
          id="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setServerError(null);
          }}
          validate={validateEmail}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          validate={validatePassword}
        />

        <Captcha path="/auth/signup" method="POST" ref={captchaRef} />

        {serverError && <p className="text-red-500 mb-4">{serverError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition mb-4 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-black font-semibold hover:underline"
        >
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}
