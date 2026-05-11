'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

export enum Permission {
  // Categories
  CREATE_CATEGORIES = 'CREATE_CATEGORIES',
  EDIT_CATEGORIES = 'EDIT_CATEGORIES',
  DELETE_CATEGORIES = 'DELETE_CATEGORIES',
  PIN_CATEGORIES = 'PIN_CATEGORIES',
  RESTORE_CATEGORIES = 'RESTORE_CATEGORIES',

  // Users
  BAN_USERS = 'BAN_USERS',
  UNBAN_USERS = 'UNBAN_USERS',
  DELETE_USERS = 'DELETE_USERS',
  EDIT_USER_PERMISSIONS = 'EDIT_USER_PERMISSIONS',

  // Tasks
  DELETE_ANY_TASK = 'DELETE_ANY_TASK',
  DISCARD_FREELANCER = 'DISCARD_FREELANCER',
  EDIT_ANY_TASK = 'EDIT_ANY_TASK',

  // Comments
  DELETE_ANY_COMMENT = 'DELETE_ANY_COMMENT',

  // Reports
  VIEW_REPORTS = 'VIEW_REPORTS',
  RESOLVE_REPORTS = 'RESOLVE_REPORTS',

  // System
  MANAGE_ADMINS = 'MANAGE_ADMINS',
}

export interface UsePermissionsReturn {
  can: (permission: Permission) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
  canAll: (...permissions: Permission[]) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  globalPermissions: string[];
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isAdmin } = useAuth();

  const globalPermissions: string[] = useMemo(
    () => user?.globalPermissions?.permissions ?? [],
    [user],
  );

  // Super admin = has MANAGE_ADMINS or all permissions (ROOT level)
  const isSuperAdmin = useMemo(
    () => globalPermissions.includes(Permission.MANAGE_ADMINS),
    [globalPermissions],
  );

  const can = useCallback(
    (permission: Permission): boolean => {
      if (isSuperAdmin) return true;
      return globalPermissions.includes(permission);
    },
    [globalPermissions, isSuperAdmin],
  );

  const canAny = useCallback(
    (...permissions: Permission[]): boolean => {
      if (isSuperAdmin) return true;
      return permissions.some((p) => globalPermissions.includes(p));
    },
    [globalPermissions, isSuperAdmin],
  );

  const canAll = useCallback(
    (...permissions: Permission[]): boolean => {
      if (isSuperAdmin) return true;
      return permissions.every((p) => globalPermissions.includes(p));
    },
    [globalPermissions, isSuperAdmin],
  );

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isSuperAdmin,
    globalPermissions,
  };
}
