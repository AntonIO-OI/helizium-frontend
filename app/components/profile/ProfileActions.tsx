'use client';

import {
  LucideShield,
  LucideKey,
  LucideEye,
  LucideMail,
  LucideLogOut,
  LucideTrash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileButton from './ProfileButton';
import { deleteUser } from '@/app/data/mockUsers';
import { ApiToken, User } from '@/app/types/search';
import { delay } from '@/app/utils/storage';
import Toast from '../Toast';
import InputField from '../InputField';

import { useQRCode } from 'next-qrcode';

export interface ProfileActionsInterface {
  viewTopicsDisabled: boolean;
  viewTakenDisabled: boolean;
}

export default function ProfileActions({
  viewTopicsDisabled,
  viewTakenDisabled,
}: ProfileActionsInterface) {
  const { Canvas } = useQRCode();

  const router = useRouter();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

  const logoutHandler = () => {
    localStorage.removeItem('userId');
    router.push('/');
  };

  const deleteAccountHandler = () => {
    const userId = +localStorage.getItem('userId')!;
    deleteUser(userId);
    logoutHandler();
  };

  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [isTotpModalOpen, setTotpModalOpen] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpInput, setTotpInput] = useState('');

  const [isConfirmEmailModalOpen, setConfirmEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const validatePassword = (value: string) => {
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;
    if (!PASSWORD_REGEX.test(value)) {
      return 'Invalid password format';
    }
    return null;
  };

  const changePasswordHandler = async () => {
    if (
      !oldPassword ||
      !newPassword ||
      !!validatePassword(oldPassword) ||
      !!validatePassword(newPassword)
    ) {
      return;
    }

    const userId = +localStorage.getItem('userId')!;
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    const userData = users.find((user) => user.id === userId);

    if (!userData) {
      setToast({ message: 'User not found.', type: 'error' });
      return;
    }

    if (oldPassword === newPassword) {
      setToast({
        message: 'Old and new passwords cannot be the same.',
        type: 'error',
      });
      return;
    }

    if (oldPassword !== userData.password) {
      setToast({ message: 'Old password is incorrect.', type: 'error' });
      return;
    }

    userData.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    await delay(400);
    logoutHandler();
  };

  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [isReadonly, setIsReadonly] = useState(false);

  const [isMailSent, setIsMailSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateToken = () => {
    if (tokenName.length < 3) {
      setToast({
        message: 'Token name must be at least 3 characters.',
        type: 'error',
      });
      return;
    }

    const newToken = Array(30)
      .fill(null)
      .map(() => Math.random().toString(36).substring(2, 3))
      .join('');

    const newTokenObj: ApiToken = {
      title: tokenName,
      token: newToken,
      readonly: isReadonly,
    };

    const updatedTokens = [...apiTokens, newTokenObj];
    setApiTokens(updatedTokens);
    saveTokensToLocalStorage(updatedTokens);
    setGeneratedToken(newToken);
    setTokenName('');
    setIsReadonly(false);
    setToast({ message: 'Token saved successfully!', type: 'success' });
  };

  const deleteToken = (index: number) => {
    const updatedTokens = apiTokens.filter((_, i) => i !== index);
    setApiTokens(updatedTokens);
    saveTokensToLocalStorage(updatedTokens);
    setToast({ message: 'Token deleted successfully!', type: 'success' });
  };

  const fetchUser = () => {
    const userId = +localStorage.getItem('userId')!;
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    return users.find((user) => user.id === userId)!;
  };

  useEffect(() => {
    const user = fetchUser();
    setEmailConfirmed(user.emailConfirmed);
    setMfaEnabled(user.mfa);
    setTotpEnabled(user.totp);
  }, [setEmailConfirmed, setMfaEnabled, setTotpEnabled]);

  const openTokenModal = () => {
    const userData = fetchUser();
    setApiTokens(userData.apiTokens || []);
    setTokenModalOpen(true);
  };

  const closeTokenModal = () => {
    setGeneratedToken(null);
    setTokenModalOpen(false);
    setTokenName('');
    setIsReadonly(false);
  };

  const obfuscateToken = (token: string) =>
    `${token.slice(0, 4)}...${token.slice(-4)}`;

  const saveTokensToLocalStorage = (newTokens: ApiToken[]) => {
    const userId = +localStorage.getItem('userId')!;
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    const userData = users.find((user) => user.id === userId)!;

    userData.apiTokens = newTokens;
    localStorage.setItem('users', JSON.stringify(users));
  };

  const changeMFA = () => {
    const userId = +localStorage.getItem('userId')!;
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    const userData = users.find((user) => user.id === userId)!;
    userData.mfa = !userData.mfa;

    if (totpEnabled) {
      userData.totp = false;
    }

    localStorage.setItem('users', JSON.stringify(users));

    setToast({
      message: `MFA ${mfaEnabled ? 'disabled' : 'enabled'} successfully`,
      type: 'success',
    });

    if (mfaEnabled) {
      setMfaEnabled(false);
      if (totpEnabled) {
        setTotpEnabled(false);
      }
    } else {
      setMfaEnabled(true);
    }
  };

  const openDeleteModal = () => setDeleteModalOpen(true);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  const openConfirmEmailModal = () => setConfirmEmailModalOpen(true);
  const closeConfirmEmailModal = () => setConfirmEmailModalOpen(false);

  const openChangePasswordModal = () => setChangePasswordOpen(true);
  const closeChangePasswordModal = () => setChangePasswordOpen(false);

  const saveUserData = (updatedUser: User) => {
    const usersFromLocalStorage = localStorage.getItem('users')!;
    const users: User[] = JSON.parse(usersFromLocalStorage);
    const userIndex = users.findIndex((user) => user.id === updatedUser.id);
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
  };

  const sendMail = async () => {
    const user = fetchUser();
    const code = generateRandomCode();

    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          template: 'confirm.mail',
          context: {
            appName: 'Helizium',
            otp: code,
            username: user.username,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setIsMailSent(true);
      setEmailCode(code);
      setToast({ message: 'Email code sent successfully', type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Error sending email code', type: 'error' });
    }
  };

  const confirmEmail = () => {
    if (!emailInput) {
      setToast({
        message: 'Enter email code',
        type: 'error',
      });
      return;
    }

    if (emailInput.endsWith(' ') || (emailCode && emailInput !== emailCode)) {
      setToast({
        message: 'Invlid email code',
        type: 'error',
      });
      return;
    }

    const user = fetchUser();
    user.emailConfirmed = true;
    saveUserData(user);
    setEmailConfirmed(true);
    router.push('/confirm-email?code=' + emailCode);
  };

  const openTotpModal = () => {
    const newSecret = Array(16)
      .fill(null)
      .map(() => Math.random().toString(36).substring(2, 3))
      .join('');
    setTotpSecret(newSecret);
    setTotpModalOpen(true);
  };

  const closeTotpModal = () => {
    setTotpModalOpen(false);
    setTotpSecret('');
    setTotpInput('');
  };

  const enableTotpHandler = () => {
    if (totpInput && !totpInput.endsWith(' ')) {
      const user = fetchUser();
      user.totp = true;
      saveUserData(user);
      setTotpEnabled(true);
      setToast({ message: 'TOTP enabled successfully!', type: 'success' });
      closeTotpModal();
    } else {
      setToast({ message: 'Invalid TOTP input.', type: 'error' });
    }
  };

  const disableTotpHandler = () => {
    const user = fetchUser();
    user.totp = false;
    saveUserData(user);
    setTotpEnabled(false);
    setToast({ message: 'TOTP disabled successfully!', type: 'success' });
  };

  return (
    <div className="space-y-8">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {/* Primary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProfileButton
          label="View Topics"
          variant="primary"
          icon={LucideEye}
          onClick={() => router.push('/profile/tasks/created')}
          disabled={viewTopicsDisabled}
          fullWidth
        />
        <ProfileButton
          label="View Taken"
          variant="primary"
          icon={LucideEye}
          onClick={() => router.push('/profile/tasks/taken')}
          disabled={viewTakenDisabled}
          fullWidth
        />

        {emailConfirmed ? (
          <ProfileButton
            label="Delete Account"
            variant="danger"
            icon={LucideTrash}
            onClick={openDeleteModal}
            fullWidth
          />
        ) : (
          <ProfileButton
            label="Confirm Email"
            variant="success"
            icon={LucideMail}
            onClick={openConfirmEmailModal}
            fullWidth
          />
        )}

        <ProfileButton
          label="Logout"
          variant="danger"
          icon={LucideLogOut}
          onClick={logoutHandler}
          fullWidth
        />
      </div>

      {/* Security Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Security Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileButton
            label={mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
            variant="secondary"
            icon={LucideShield}
            onClick={changeMFA}
            disabled={!emailConfirmed}
            fullWidth
          />
          <ProfileButton
            label={totpEnabled ? 'Disable TOTP' : 'Enable TOTP'}
            variant="secondary"
            icon={LucideShield}
            onClick={totpEnabled ? disableTotpHandler : openTotpModal}
            fullWidth
            disabled={!mfaEnabled}
          />
          <ProfileButton
            label="API Tokens"
            variant="secondary"
            icon={LucideKey}
            onClick={openTokenModal}
            fullWidth
            disabled={!emailConfirmed}
          />
          <ProfileButton
            label="Change Password"
            variant="secondary"
            icon={LucideKey}
            onClick={openChangePasswordModal}
            fullWidth
          />
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Change Password</h2>
            <div className="">
              <InputField
                type="password"
                id="oldPassword"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                validate={validatePassword}
              />
              <InputField
                type="password"
                id="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                validate={validatePassword}
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                onClick={changePasswordHandler}
                disabled={
                  !oldPassword ||
                  !newPassword ||
                  !!validatePassword(oldPassword) ||
                  !!validatePassword(newPassword)
                }
              >
                Change
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={closeChangePasswordModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-red-600">
              Confirm Account Deletion
            </h2>
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={deleteAccountHandler}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Manage API Tokens</h2>

            {generatedToken ? (
              <div>
                <p>Your new token:</p>
                <p className="bg-gray-200 p-2 rounded text-sm font-mono">
                  {generatedToken}
                </p>
                <p className="text-xs text-gray-500">
                  Copy this token now. It will not be shown again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <InputField
                  id="tokenName"
                  type="text"
                  placeholder="Token Name"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isReadonly}
                    onChange={(e) => setIsReadonly(e.target.checked)}
                  />
                  <span>Read-only Token</span>
                </label>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={generateToken}
                >
                  Generate Token
                </button>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Your Tokens</h3>
              {apiTokens.length === 0 ? (
                <p className="text-gray-500">No tokens created yet.</p>
              ) : (
                apiTokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <span>
                      {token.title} ({obfuscateToken(token.token)})
                    </span>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteToken(index)}
                    >
                      <LucideTrash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={closeTokenModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isTotpModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Enable TOTP</h2>
            <p>Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center">
              <Canvas
                text={`otpauth://totp/Helizium:Helizium?issuer=Helizium&secret=${totpSecret}&algorithm=SHA1&digits=6&period=30`}
                options={{
                  errorCorrectionLevel: 'L',
                  margin: 0,
                  scale: 5,
                  width: 200,
                }}
              />
            </div>
            <p className="text-sm text-gray-500">Secret: {totpSecret}</p>
            <InputField
              id="totpInput"
              type="text"
              placeholder="Enter TOTP Code"
              value={totpInput}
              onChange={(e) => setTotpInput(e.target.value)}
            />
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={enableTotpHandler}
              >
                Enable
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={closeTotpModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmEmailModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Confirm email</h2>
            <p>Enter code we send you by email:</p>
            <InputField
              id="totpInput"
              type="text"
              placeholder="Email code"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            {isMailSent ? (
              <p className="text-blue-600">We sent another mail</p>
            ) : (
              <a href="#" className="text-blue-600" onClick={sendMail}>
                Resend code
              </a>
            )}
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={confirmEmail}
              >
                Confirm email
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={closeConfirmEmailModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
