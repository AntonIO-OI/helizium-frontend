'use client';

import {
  LucideShield,
  LucideKey,
  LucideEye,
  LucideMail,
  LucideLogOut,
  LucidePlus,
  LucideTrash,
  LucideLock,
  LucideToggleLeft,
  LucideToggleRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProfileButton from './ProfileButton';
import Toast from '../Toast';
import InputField from '../InputField';
import { authApi, ApiTokenRecord, MfaInfo } from '../../lib/api/auth';
import { useQRCode } from 'next-qrcode';

interface ProfileActionsProps {
  userId: string;
  limits: string;
  isEmailConfirmed: boolean;
  isBanned: boolean;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{}|;:'",.<>?\/\\-]{8,32}$/;
const validatePassword = (v: string) =>
  PASSWORD_REGEX.test(v) ? null : 'Invalid password format';

export default function ProfileActions({
  userId,
  limits,
  isEmailConfirmed,
  isBanned,
  onLogout,
  onRefresh,
}: ProfileActionsProps) {
  const { Canvas } = useQRCode();
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({ message: '', type: '' });

  const isMfaRoot = limits === 'ROOT' || limits === 'BANNED_ROOT';

  // ── MFA status ───────────────────────────────────────────────────────
  const [mfaInfo, setMfaInfo] = useState<MfaInfo | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    authApi.getMfa().then((res) => {
      if (res.data) setMfaInfo(res.data);
    });
  }, []);

  // ── Session elevation ────────────────────────────────────────────────
  const [isElevationOpen, setIsElevationOpen] = useState(false);
  const [pendingElevatedAction, setPendingElevatedAction] = useState<
    (() => void) | null
  >(null);
  const [elevationCode, setElevationCode] = useState('');
  const [elevationCodeSent, setElevationCodeSent] = useState(false);
  const [elevationLoading, setElevationLoading] = useState(false);

  const withElevation = (action: () => void) => {
    if (isMfaRoot) {
      action();
    } else {
      setPendingElevatedAction(() => action);
      setElevationCode('');
      setElevationCodeSent(false);
      setIsElevationOpen(true);
    }
  };

  const handleElevationSendCode = async () => {
    setElevationLoading(true);
    const res = await authApi.sendEmailMfaCode();
    setElevationLoading(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setElevationCodeSent(true);
    setToast({ message: 'Verification code sent to your email.', type: 'success' });
  };

  const handleElevationConfirm = async () => {
    if (!elevationCode.trim()) {
      setToast({ message: 'Enter the verification code.', type: 'error' });
      return;
    }
    setElevationLoading(true);
    const confirmRes = await authApi.confirmEmailMfaCode(userId, elevationCode);
    if (confirmRes.error) {
      setElevationLoading(false);
      setToast({ message: confirmRes.error, type: 'error' });
      return;
    }
    await authApi.refresh();
    await onRefresh();
    setElevationLoading(false);
    setIsElevationOpen(false);
    if (pendingElevatedAction) {
      setTimeout(() => {
        pendingElevatedAction();
        setPendingElevatedAction(null);
      }, 50);
    }
  };

  // ── MFA Required toggle ──────────────────────────────────────────────
  const toggleMfaRequired = async () => {
    if (!mfaInfo) return;
    const newRequired = !mfaInfo.required;
    setMfaLoading(true);
    const res = await authApi.setMfaRequired(newRequired);
    setMfaLoading(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setMfaInfo((prev) => prev ? { ...prev, required: newRequired } : prev);
    setToast({
      message: newRequired
        ? 'MFA is now required on every login.'
        : 'MFA is no longer required on login.',
      type: 'success',
    });
  };

  // ── Change password ──────────────────────────────────────────────────
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const changePasswordHandler = async () => {
    if (!oldPassword || !newPassword || validatePassword(oldPassword) || validatePassword(newPassword))
      return;
    if (oldPassword === newPassword) {
      setToast({ message: 'New and old passwords cannot be the same.', type: 'error' });
      return;
    }
    const res = await authApi.changePassword(oldPassword, newPassword);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setToast({ message: 'Password changed. Please log in again.', type: 'success' });
    await authApi.terminate();
    setTimeout(() => router.push('/login'), 1500);
  };

  // ── API Tokens ───────────────────────────────────────────────────────
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
  const [apiTokens, setApiTokens] = useState<ApiTokenRecord[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [isReadonly, setIsReadonly] = useState(false);
  const [isTokensLoading, setTokensLoading] = useState(false);

  const openTokenModal = async () => {
    setTokensLoading(true);
    setTokenModalOpen(true);
    const res = await authApi.getApiTokens();
    setTokensLoading(false);
    if (res.data) setApiTokens(res.data.tokens || []);
  };

  const generateToken = async () => {
    if (tokenName.length < 3) {
      setToast({ message: 'Token name must be at least 3 characters.', type: 'error' });
      return;
    }
    const res = await authApi.createApiToken(tokenName, !isReadonly);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setGeneratedToken(res.data?.token || null);
    const refreshRes = await authApi.getApiTokens();
    if (refreshRes.data) setApiTokens(refreshRes.data.tokens || []);
    setTokenName('');
    setIsReadonly(false);
    setToast({ message: 'Token created!', type: 'success' });
  };

  const deleteToken = async (jti: string) => {
    await authApi.deleteApiToken(jti);
    const refreshRes = await authApi.getApiTokens();
    if (refreshRes.data) setApiTokens(refreshRes.data.tokens || []);
    setToast({ message: 'Token deleted.', type: 'success' });
  };

  // ── TOTP ─────────────────────────────────────────────────────────────
  const [isTotpModalOpen, setTotpModalOpen] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const [totpInput, setTotpInput] = useState('');

  const openTotpModal = async () => {
    const res = await authApi.initTotp();
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setTotpUri(res.data?.uri || '');
    setTotpModalOpen(true);
  };

  const enableTotpHandler = async () => {
    if (!totpInput) {
      setToast({ message: 'Enter TOTP code.', type: 'error' });
      return;
    }
    const res = await authApi.confirmTotp(totpInput);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    await onRefresh();
    setMfaInfo((prev) =>
      prev ? { ...prev, methods: [...new Set([...prev.methods, 'TOTP'])] } : prev,
    );
    setToast({ message: 'TOTP enabled!', type: 'success' });
    setTotpModalOpen(false);
  };

  const disableTotpHandler = async () => {
    const res = await authApi.disableTotp();
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setMfaInfo((prev) =>
      prev ? { ...prev, methods: prev.methods.filter((m) => m !== 'TOTP') } : prev,
    );
    setToast({ message: 'TOTP disabled.', type: 'success' });
  };

  // ── Email confirm ────────────────────────────────────────────────────
  const [isConfirmEmailModalOpen, setConfirmEmailModalOpen] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);

  const sendEmailConfirmCode = async () => {
    setEmailCodeSending(true);
    const res = await authApi.sendEmailMfaCode();
    setEmailCodeSending(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    setEmailCodeSent(true);
    setToast({ message: 'Code sent!', type: 'success' });
  };

  const confirmEmailHandler = async () => {
    if (!emailCode) {
      setToast({ message: 'Enter the email code.', type: 'error' });
      return;
    }
    const res = await authApi.confirmEmailMfaCode(userId, emailCode);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
      return;
    }
    await authApi.refresh();
    await onRefresh();
    setToast({ message: 'Email confirmed!', type: 'success' });
    setConfirmEmailModalOpen(false);
  };

  const logoutHandler = async () => {
    await authApi.logout();
    onLogout();
    router.push('/');
  };

  const isTotpEnabled = mfaInfo?.methods.includes('TOTP') ?? false;

  return (
    <div>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      {/* ── Primary actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProfileButton
          label="View Topics"
          variant="primary"
          icon={LucideEye}
          onClick={() => router.push('/profile/tasks/created')}
          fullWidth
        />
        <ProfileButton
          label="Create Task"
          variant="primary"
          icon={LucidePlus}
          onClick={() => router.push('/task/create')}
          disabled={!isEmailConfirmed || isBanned}
          fullWidth
        />
        <ProfileButton
          label="View Taken"
          variant="primary"
          icon={LucideEye}
          onClick={() => router.push('/profile/tasks/taken')}
          fullWidth
        />
        {!isEmailConfirmed && (
          <ProfileButton
            label="Confirm Email"
            variant="success"
            icon={LucideMail}
            onClick={() => setConfirmEmailModalOpen(true)}
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

      {/* ── Security settings ── */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold">Security Settings</h2>
          {!isMfaRoot && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Some options require identity verification
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          API tokens and authenticator setup require a quick email verification for your protection.
        </p>

        {/* MFA Required toggle */}
        {isEmailConfirmed && mfaInfo !== null && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  Login MFA Requirement
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {mfaInfo.required
                    ? 'MFA is currently required on every login.'
                    : 'MFA is not required on login.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Available methods: {mfaInfo.methods.join(', ')}
                </p>
              </div>
              <button
                onClick={() => withElevation(toggleMfaRequired)}
                disabled={mfaLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm disabled:opacity-50 ${
                  mfaInfo.required
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mfaInfo.required ? (
                  <LucideToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <LucideToggleLeft className="w-5 h-5 text-gray-500" />
                )}
                {mfaInfo.required ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileButton
            label="Change Password"
            variant="secondary"
            icon={LucideKey}
            onClick={() => setChangePasswordOpen(true)}
            fullWidth
          />
          <ProfileButton
            label="API Tokens"
            variant="secondary"
            icon={LucideKey}
            onClick={() => withElevation(openTokenModal)}
            fullWidth
            disabled={!isEmailConfirmed}
          />
          <ProfileButton
            label={isTotpEnabled ? 'Reconfigure TOTP' : 'Setup TOTP Authenticator'}
            variant="secondary"
            icon={LucideShield}
            onClick={() => withElevation(openTotpModal)}
            fullWidth
            disabled={!isEmailConfirmed}
          />
          {isTotpEnabled && (
            <ProfileButton
              label="Disable TOTP"
              variant="secondary"
              icon={LucideShield}
              onClick={() => withElevation(disableTotpHandler)}
              fullWidth
              disabled={!isEmailConfirmed}
            />
          )}
        </div>
      </div>

      {/* ══════════════════ ELEVATION MODAL ══════════════════ */}
      {isElevationOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <LucideLock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Verify Your Identity</h2>
                <p className="text-sm text-gray-500">
                  Confirm your email to access this security feature.
                </p>
              </div>
            </div>

            {!elevationCodeSent ? (
              <button
                onClick={handleElevationSendCode}
                disabled={elevationLoading}
                className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition"
              >
                {elevationLoading ? 'Sending…' : 'Send Verification Code'}
              </button>
            ) : (
              <>
                <InputField
                  id="elevationCode"
                  type="text"
                  placeholder="Enter 6-digit code from your email"
                  value={elevationCode}
                  onChange={(e) => setElevationCode(e.target.value)}
                />
                <button
                  onClick={handleElevationConfirm}
                  disabled={elevationLoading || !elevationCode.trim()}
                  className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {elevationLoading ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </>
            )}

            <button
              className="w-full py-2 border rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition"
              onClick={() => {
                setIsElevationOpen(false);
                setPendingElevatedAction(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ CHANGE PASSWORD MODAL ══════════════════ */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Change Password</h2>
            <InputField
              type="password"
              id="oldPassword"
              placeholder="Current Password"
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
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
                onClick={() => setChangePasswordOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ API TOKENS MODAL ══════════════════ */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Manage API Tokens</h2>
            {isTokensLoading ? (
              <p>Loading tokens…</p>
            ) : (
              <>
                {generatedToken ? (
                  <div>
                    <p className="font-semibold mb-2">Your new API token (copy now!):</p>
                    <p className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                      {generatedToken}
                    </p>
                    <button
                      className="mt-3 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      onClick={() => setGeneratedToken(null)}
                    >
                      Create another
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <InputField
                      id="tokenName"
                      type="text"
                      placeholder="Token Name (min 3 chars)"
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
                  <h3 className="font-semibold">Existing Tokens</h3>
                  {apiTokens.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tokens yet.</p>
                  ) : (
                    apiTokens.map((token) => (
                      <div
                        key={token.jti}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded"
                      >
                        <span className="text-sm">
                          {token.title} ({token.writeAccess ? 'write' : 'read-only'})
                        </span>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => deleteToken(token.jti)}
                        >
                          <LucideTrash size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={() => {
                setGeneratedToken(null);
                setTokenModalOpen(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ TOTP MODAL ══════════════════ */}
      {isTotpModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Enable TOTP Authenticator</h2>
            <p>Scan this QR code with your authenticator app:</p>
            {totpUri && (
              <div className="flex justify-center">
                <Canvas
                  text={totpUri}
                  options={{ errorCorrectionLevel: 'L', margin: 0, scale: 5, width: 200 }}
                />
              </div>
            )}
            <InputField
              id="totpInput"
              type="text"
              placeholder="Enter TOTP Code to confirm"
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
                onClick={() => setTotpModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CONFIRM EMAIL MODAL ══════════════════ */}
      {isConfirmEmailModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-bold">Confirm Email</h2>
            <p className="text-sm text-gray-600">
              Click &quot;Send Code&quot; to receive a confirmation code by email.
            </p>
            {!emailCodeSent ? (
              <button
                onClick={sendEmailConfirmCode}
                disabled={emailCodeSending}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {emailCodeSending ? 'Sending…' : 'Send Code'}
              </button>
            ) : (
              <>
                <InputField
                  id="emailConfirmCode"
                  type="text"
                  placeholder="6-digit code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                />
                <div className="flex space-x-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={confirmEmailHandler}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                    onClick={() => setConfirmEmailModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
