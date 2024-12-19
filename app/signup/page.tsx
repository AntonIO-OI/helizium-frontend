'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha, { CaptchaRef } from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';
import { useEffect, useRef, useState } from 'react';
import { User } from '../types/search';
import { useRouter } from 'next/navigation';
import { formatDate } from '../utils/formatDate';
import { delay } from '../utils/storage';

const USERNAME_VALIDATOR_MESSAGE =
  'Username should be 4-30 characters long and contain only English letters, digits and underscores.';
const PASSWORD_VALIDATOR_MESSAGE =
  'Password must be 8-32 characters long. At least lowercase letter, uppercase letter and digit required';

const USERNAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{4,30}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [userExistsError, setUserExistsError] = useState<string | null>(null);

  const captchaRef = useRef<CaptchaRef>(null);

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

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validateUsername = (value: string) => {
    if (!USERNAME_REGEX.test(value)) {
      return USERNAME_VALIDATOR_MESSAGE;
    }
    return null;
  };

  const validatePassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      return PASSWORD_VALIDATOR_MESSAGE;
    }
    return null;
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const captchaId = captchaRef.current?.getCaptchaId();
    const captchaAnswer = captchaRef.current?.getCaptchaValue();

    if (!captchaId || !captchaAnswer) {
      alert('Please complete the captcha');
      return;
    }

    if (captchaAnswer.endsWith(' ')) {
      alert('Invalid captcha');
      captchaRef.current?.refreshCaptcha();
      return;
    }

    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setUsernameError(usernameError);
    setEmailError(emailError);
    setPasswordError(passwordError);

    if (usernameError || emailError || passwordError) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(
      (user: User) => user.username === username || user.email === email,
    );

    if (userExists) {
      setUserExistsError('Username or email already exists.');
      return;
    }

    setUserExistsError(null);

    const id = getRndInteger(100, 999);

    const newUser: User = {
      username,
      email,
      password,
      emailConfirmed: false,
      id,
      avatar: '',
      rating: 0,
      completedTasks: 0,
      joinedDate: formatDate(new Date()),
      admin: false,
      mfa: false,
      totp: false,
    };

    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userId', String(id));

    await delay(400);

    router.push('/profile');
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Join Helizium and unlock the potential of secure, blockchain-powered freelancing."
    >
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
            setUserExistsError('');
          }}
          validate={validateUsername}
          error={usernameError}
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
            setUserExistsError('');
          }}
          validate={validateEmail}
          error={emailError}
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
          error={passwordError}
        />

        <Captcha path="/auth/signup" method="POST" ref={captchaRef} />

        {userExistsError && (
          <p className="text-red-500 mb-4">{userExistsError}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition mb-4 disabled:bg-gray-400"
        >
          Sign Up
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
