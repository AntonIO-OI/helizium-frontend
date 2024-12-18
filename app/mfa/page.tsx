'use client';

import InputField from '../components/InputField';
import AuthLayout from '../components/AuthLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { delay } from '../utils/storage';
import Toast from '../components/Toast';

export default function MFA() {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [randomCode, setRandomCode] = useState('');

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | '';
  }>({ message: '', type: '' });

  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: { id: number }) => user.id === +userId);

    if (!user.mfa) {
      router.push('/profile');
      return;
    }

    if (user.totp) {
      setTotpEnabled(true);
    }

    setEmail(user.email);
  }, [router, setTotpEnabled, setEmail]);

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit random code
  };

  const handleSendEmailCode = async () => {
    if (!email) {
      setToast({ message: 'Email not found', type: 'error' });
      return;
    }

    const code = generateRandomCode();
    setRandomCode(code);

    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'maximax6767@gmail.com',
          template: 'mfa.mail', // Update this to match your EmailTemplatesEnum
          context: {
            appName: 'Helizium',
            otp: code,
            username: email.split('@')[0], // Extract username from email
            url: 'https://localhost:3001/profile?mfaToken=' + code,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailCodeSent(true);
      setToast({ message: 'Email code sent successfully', type: '' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Error sending email code', type: 'error' });
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      emailCodeSent &&
      (!emailCode || emailCode !== randomCode) &&
      (!totpCode || totpCode.endsWith(' '))
    ) {
      setToast({ message: 'Invalid email code', type: 'error' });
      return;
    }

    if (!emailCodeSent && !totpEnabled) {
      setToast({ message: 'You did not send the confirmation code', type: 'error' });
      return;
    }

    if (!emailCodeSent && (!totpCode || totpCode.endsWith(' '))) {
      setToast({ message: 'Invalid TOTP code', type: 'error' });
      return;
    }

    await delay(400);

    router.push('/profile');
  };

  return (
    <AuthLayout
      title="MFA Required"
      description="Pass MFA to sign in your Helizium account and enjoy seamless payments powered by Ethereum."
    >
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleMfaSubmit}>
        {!emailCodeSent ? (
          <div className="mb-4 sm:mb-6">
            <button
              type="button"
              onClick={handleSendEmailCode}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-md hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Send Email Code to{' '}
              {email && email.replace(/(.{2}).+(@.+)/, '$1***$2')}
            </button>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <InputField
              id="emailCode"
              type="text"
              placeholder="Enter Email Code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
            />
          </div>
        )}

        {totpEnabled && (
          <>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="mb-4 sm:mb-6">
              <InputField
                id="totpCode"
                type="text"
                placeholder="Enter TOTP Code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2.5 sm:py-3 rounded-md hover:bg-gray-800 transition text-sm sm:text-base"
        >
          Confirm MFA
        </button>
      </form>
    </AuthLayout>
  );
}
