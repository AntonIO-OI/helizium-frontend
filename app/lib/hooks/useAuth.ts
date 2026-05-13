'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi, TokenInfo } from '../api/auth';
import { usersApi, UserProfile } from '../api/users';

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  tokenInfo: TokenInfo | null;
  user: UserProfile | null;
  userId: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBanned: boolean;
  isEmailConfirmed: boolean;
  limits: string;
  globalPermissions: string[];
}

const initial: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  tokenInfo: null,
  user: null,
  userId: null,
  isAdmin: false,
  isSuperAdmin: false,
  isBanned: false,
  isEmailConfirmed: false,
  limits: '',
  globalPermissions: [],
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initial);
  const fetching = useRef(false);

  const refresh = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    setState((s) => ({ ...s, isLoading: true }));

    try {
      const infoRes = await authApi.info();
      if (infoRes.error || !infoRes.data) {
        setState({ ...initial, isLoading: false });
        return;
      }

      const tokenInfo = infoRes.data;
      const isEmailConfirmed =
        tokenInfo.limits !== 'EMAIL_NOT_CONFIRMED' && tokenInfo.limits !== 'MFA_REQUIRED';
      const isBanned =
        tokenInfo.limits === 'USER_BANNED' || tokenInfo.limits === 'BANNED_ROOT';

      let user: UserProfile | null = null;
      let globalPermissions: string[] = [];
      let isAdmin = false;
      let isSuperAdmin = false;

      const meRes = await usersApi.getMe();
      if (meRes.data?.user) {
        user = meRes.data.user;
        globalPermissions = user.globalPermissions?.permissions ?? [];
        isAdmin = globalPermissions.length > 0;
        isSuperAdmin = globalPermissions.includes('MANAGE_ADMINS');
      }

      setState({
        isLoading: false,
        isAuthenticated: true,
        tokenInfo,
        user,
        userId: tokenInfo.userId,
        isAdmin,
        isSuperAdmin,
        isBanned,
        isEmailConfirmed,
        limits: tokenInfo.limits,
        globalPermissions,
      });
    } finally {
      fetching.current = false;
    }
  }, []);

  // Optimistic patch — updates a user field locally without a full re-fetch.
  const patchUser = useCallback((updates: Partial<UserProfile>) => {
    setState((s) =>
      s.user ? { ...s, user: { ...s.user, ...updates } } : s,
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ ...initial, isLoading: false });
  }, []);

  return { ...state, refresh, logout, patchUser };
}
