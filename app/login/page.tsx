'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginError, setLoginError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const validatePassword = (value: string) => {
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;
    if (!PASSWORD_REGEX.test(value)) {
      return 'Invalid password format';
    }
    return null;
  };

  const validateLogin = (value: string) => {
    const LOGIN_REGEX =
      /^(?=.{4,254}$)((?=.*[a-zA-Z])[a-zA-Z0-9_]{4,30}|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/;

    if (!LOGIN_REGEX.test(value)) {
      return 'Login should be a valid username or email';
    }

    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPasswordError(null);

    const passwordError = validatePassword(password);
    setPasswordError(passwordError);
    if (passwordError) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      (user: { username: string; email: string; password: string }) =>
        (user.username === loginOrEmail || user.email === loginOrEmail) &&
        user.password === password,
    );

    if (!user) {
      setLoginError('Invalid login or password');
      return;
    }

    localStorage.setItem('userId', String(user.id));

    router.push('/profile');
  };

  return (
    <AuthLayout
      title="Login"
      description="Log in to your Helizium account and enjoy seamless payments powered by Ethereum."
    >
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
          error={passwordError}
        />

        {loginError && <p className="text-red-500 mb-4">{loginError}</p>}

        <div className="mb-4 sm:mb-6 text-right">
          <Link
            href="/forgot-password"
            className="text-blue-500 hover:underline text-sm sm:text-base"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2.5 sm:py-3 rounded-md hover:bg-gray-800 transition text-sm sm:text-base"
        >
          Sign In
        </button>

        <p className="text-center mt-4 sm:mt-6 text-sm sm:text-base">
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
