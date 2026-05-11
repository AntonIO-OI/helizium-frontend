'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import { authApi } from '../lib/api/auth';
import Captcha, { CaptchaRef } from '../components/Captcha';

export default function Login() {
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });
  const captchaRef = useRef<CaptchaRef>(null);
  const router = useRouter();

  const validatePassword = (value: string) => {
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;
    return PASSWORD_REGEX.test(value) ? null : 'Invalid password format';
  };

  const validateLogin = (value: string) => {
    const LOGIN_REGEX =
      /^(?=.{4,254}$)((?=.*[a-zA-Z])[a-zA-Z0-9_]{4,30}|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/;
    return LOGIN_REGEX.test(value)
      ? null
      : 'Login should be a valid username or email';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (validateLogin(loginOrEmail) || validatePassword(password)) {
      setLoginError('Please fix the validation errors above');
      return;
    }

    const captchaId = captchaRef.current?.getCaptchaId() ?? null;
    const captchaValue = captchaRef.current?.getCaptchaValue() ?? '';

    setIsLoading(true);
    const res = await authApi.sign(
      { login: loginOrEmail, password },
      captchaId ? { id: captchaId, value: captchaValue } : undefined,
    );
    setIsLoading(false);

    if (res.error) {
      setLoginError(res.error);
      captchaRef.current?.refreshCaptcha();
      return;
    }

    const mfa = res.data;
    if (mfa?.required) {
      router.push('/mfa');
      return;
    }

    router.push('/profile');
  };

  return (
    <AuthLayout
      title="Login"
      description="Log in to your Helizium account and enjoy seamless payments powered by Ethereum."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleLogin}>
        <InputField
          label="Login"
          type="text"
          id="loginOrEmail"
          placeholder="Enter your login or email"
          required
          value={loginOrEmail}
          validate={validateLogin}
          onChange={(e) => {
            setLoginOrEmail(e.target.value);
            setLoginError(null);
          }}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          required
          value={password}
          validate={validatePassword}
          onChange={(e) => {
            setPassword(e.target.value);
            setLoginError(null);
          }}
        />
        {loginError && <p className="text-red-500 mb-4">{loginError}</p>}

        <Captcha path="/auth/sign" method="POST" ref={captchaRef} />

        <div className="mb-4 sm:mb-6 text-right">
          <Link
            href="/forgot-password"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-black font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
