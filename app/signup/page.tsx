'use client';

import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';
import { useState } from 'react';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let captchaId: string | null = null;
  let captchaAnswer: string | null = null;

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if captcha is present
    if (!captchaId || !captchaAnswer) {
      alert('Please complete the captcha');
      return;
    }

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Captcha-Id': captchaId,
          'Captcha-Answer': captchaAnswer,
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful!');
        // Redirect or handle post-signup logic
      } else {
        alert(`Error: ${data.message || 'Signup failed'}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred while signing up');
    }
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
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          label="Email"
          type="email"
          id="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Captcha
          path="/auth/signup"
          method="POST"
          onCaptchaLoaded={(id) => captchaId = id}
        />

        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition mb-4"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-black font-semibold hover:underline">
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}
