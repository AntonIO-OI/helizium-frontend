'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Toast from '@/app/components/Toast';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { usersApi } from '@/app/lib/api/users';
import { tasksApi, PublicUser } from '@/app/lib/api/tasks';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import {
  Shield,
  ChevronLeft,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FolderOpen,
  RefreshCw,
  BanIcon,
  ShieldOff,
} from 'lucide-react';

// ── Enums matching backend exactly ──────────────────────────────────────

const GLOBAL_PERMISSIONS = [
  {
    value: 'BAN',
    label: 'Ban Users',
    group: 'User Management',
    desc: 'Ability to ban platform users',
  },
  {
    value: 'UNBAN',
    label: 'Unban Users',
    group: 'User Management',
    desc: 'Ability to restore banned users',
  },
  {
    value: 'EDIT_PROFILES',
    label: 'Edit Profiles',
    group: 'User Management',
    desc: 'Edit other users profile data',
  },
  {
    value: 'VIEW_OTHERS_PERMISSIONS',
    label: 'View Others Permissions',
    group: 'Permissions',
    desc: 'See permission settings of other users',
  },
  {
    value: 'SET_PERMISSIONS',
    label: 'Set Permissions',
    group: 'Permissions',
    desc: 'Grant permissions to other users',
  },
  {
    value: 'SET_PERMISSIONS_PROPAGATION',
    label: 'Propagate Set Permission',
    group: 'Permissions',
    desc: 'Allow others to grant the SET_PERMISSIONS right',
  },
  {
    value: 'REVOKE_PERMISSIONS',
    label: 'Revoke Permissions',
    group: 'Permissions',
    desc: 'Remove permissions from other users',
  },
  {
    value: 'REVOKE_PERMISSIONS_PROPAGATION',
    label: 'Propagate Revoke Permission',
    group: 'Permissions',
    desc: 'Allow others to grant the REVOKE_PERMISSIONS right',
  },
  {
    value: 'BYPASS_HIERARCHY',
    label: 'Bypass Hierarchy',
    group: 'Permissions',
    desc: 'Override permission hierarchy restrictions',
  },
  {
    value: 'ADD_BADGES',
    label: 'Add Badges',
    group: 'Cosmetics',
    desc: 'Grant badges to users',
  },
  {
    value: 'REMOVE_BADGES',
    label: 'Remove Badges',
    group: 'Cosmetics',
    desc: 'Remove badges from users',
  },
  {
    value: 'ADD_USERNAME_COLORS',
    label: 'Add Username Colors',
    group: 'Cosmetics',
    desc: 'Grant username colors',
  },
  {
    value: 'REMOVE_USERNAME_COLORS',
    label: 'Remove Username Colors',
    group: 'Cosmetics',
    desc: 'Remove username colors',
  },
] as const;

const CATEGORY_PERMISSIONS = [
  {
    value: 'CREATE',
    label: 'Create Subcategory',
    desc: 'Create child categories',
  },
  {
    value: 'EDIT',
    label: 'Edit Any Category',
    desc: 'Edit any category in this tree',
  },
  {
    value: 'EDIT_SELF',
    label: 'Edit Own Category',
    desc: 'Edit categories owned by this user',
  },
  {
    value: 'DELETE',
    label: 'Delete Any Category',
    desc: 'Delete any category in this tree',
  },
  {
    value: 'DELETE_SELF',
    label: 'Delete Own Category',
    desc: 'Delete categories owned by this user',
  },
  { value: 'PIN', label: 'Pin Category', desc: 'Pin categories to the top' },
  { value: 'UNPIN', label: 'Unpin Category', desc: 'Unpin pinned categories' },
  {
    value: 'VIEW_DELETED',
    label: 'View Deleted',
    desc: 'See deleted categories',
  },
  {
    value: 'VIEW_DELETED_SELF',
    label: 'View Own Deleted',
    desc: 'See own deleted categories',
  },
  {
    value: 'RESTORE',
    label: 'Restore Any',
    desc: 'Restore deleted categories',
  },
  {
    value: 'RESTORE_SELF',
    label: 'Restore Own',
    desc: 'Restore own deleted categories',
  },
];

const TOPIC_PERMISSIONS = [
  {
    value: 'CREATE',
    label: 'Create Tasks',
    desc: 'Post tasks in this category',
  },
  {
    value: 'EDIT',
    label: 'Edit Any Task',
    desc: 'Edit any task in this category',
  },
  {
    value: 'EDIT_SELF',
    label: 'Edit Own Tasks',
    desc: 'Edit tasks created by this user',
  },
  { value: 'DELETE', label: 'Delete Any Task', desc: 'Delete any task' },
  { value: 'DELETE_SELF', label: 'Delete Own Tasks', desc: 'Delete own tasks' },
  { value: 'COMMENT', label: 'Comment', desc: 'Leave comments on tasks' },
  { value: 'COMMENT_SELF', label: 'Comment Own', desc: 'Comment on own tasks' },
  {
    value: 'EDIT_COMMENTS',
    label: 'Edit Any Comment',
    desc: 'Edit any comment',
  },
  {
    value: 'EDIT_COMMENTS_SELF',
    label: 'Edit Own Comments',
    desc: 'Edit own comments',
  },
  {
    value: 'DELETE_COMMENTS',
    label: 'Delete Any Comment',
    desc: 'Delete any comment',
  },
  {
    value: 'DELETE_COMMENTS_SELF',
    label: 'Delete Own Comments',
    desc: 'Delete own comments',
  },
  { value: 'TAKE', label: 'Take Tasks', desc: 'Apply for tasks as freelancer' },
  {
    value: 'WANT_TO_TAKE',
    label: 'Express Interest',
    desc: 'Express interest in tasks',
  },
  {
    value: 'CONFIRM_TAKE',
    label: 'Confirm Takeover',
    desc: 'Confirm task assignment',
  },
  { value: 'COMPLETE', label: 'Complete Tasks', desc: 'Mark tasks as done' },
  {
    value: 'CONFIRM_COMPLETE',
    label: 'Confirm Completion',
    desc: 'Approve completed work',
  },
  { value: 'REPORT', label: 'Report Tasks', desc: 'Submit task reports' },
  {
    value: 'ACCESS_REPORTS',
    label: 'Access Reports',
    desc: 'View submitted reports',
  },
];

type PermissionState = 'none' | 'granted' | 'revoked';

// ── Component ────────────────────────────────────────────────────────────

export default function UserPermissionsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [targetUser, setTargetUser] = useState<PublicUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'category'>('global');
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | '';
  }>({
    message: '',
    type: '',
  });

  // Global permissions state
  const [currentGlobalPerms, setCurrentGlobalPerms] = useState<string[]>([]);
  const [selectedGlobalPerms, setSelectedGlobalPerms] = useState<Set<string>>(
    new Set(),
  );
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Category permissions state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryPerms, setCategoryPerms] = useState<{
    categoriesGranted: Set<string>;
    categoriesRevoked: Set<string>;
    topicsGranted: Set<string>;
    topicsRevoked: Set<string>;
  }>({
    categoriesGranted: new Set(),
    categoriesRevoked: new Set(),
    topicsGranted: new Set(),
    topicsRevoked: new Set(),
  });
  const [isLoadingCatPerms, setIsLoadingCatPerms] = useState(false);
  const [isSavingCatPerms, setIsSavingCatPerms] = useState(false);

  // ── Load target user ──────────────────────────────────────────────────
  useEffect(() => {
    setIsLoadingUser(true);
    tasksApi.getPublicUser(resolvedParams.userId).then((res) => {
      setTargetUser(res.data ?? null);
      setIsLoadingUser(false);
    });
  }, [resolvedParams.userId, isAdmin, router]);

  // ── Load global permissions ───────────────────────────────────────────
  const loadGlobalPerms = useCallback(async () => {
    setIsLoadingGlobal(true);
    const res = await usersApi.getGlobalPermissions(resolvedParams.userId);
    if (res.data) {
      const perms = res.data.permissions ?? [];
      setCurrentGlobalPerms(perms);
      setSelectedGlobalPerms(new Set(perms));
    }
    setIsLoadingGlobal(false);
  }, [resolvedParams.userId]);

  useEffect(() => {
    if (activeTab === 'global') {
      loadGlobalPerms();
    }
  }, [activeTab, loadGlobalPerms]);

  // ── Load categories ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'category') {
      categoriesApi.listAllCategories().then((cats) => {
        setCategories(cats);
        if (cats.length > 0) {
          const rootId = categoriesApi.getRootId(cats);
          const nonRoot = cats.filter((c) => c.id !== rootId);
          if (nonRoot.length > 0) setSelectedCategoryId(nonRoot[0].id);
        }
      });
    }
  }, [activeTab]);

  // ── Load category permissions when category changes ───────────────────
  useEffect(() => {
    if (!selectedCategoryId || activeTab !== 'category') return;
    setIsLoadingCatPerms(true);
    usersApi
      .getCategoryPermissions(resolvedParams.userId, selectedCategoryId)
      .then((res) => {
        if (
          res.data &&
          Array.isArray(res.data.permissions) &&
          res.data.permissions.length > 0
        ) {
          const latest = res.data.permissions[res.data.permissions.length - 1];
          setCategoryPerms({
            categoriesGranted: new Set(latest.categoriesGranted ?? []),
            categoriesRevoked: new Set(latest.categoriesRevoked ?? []),
            topicsGranted: new Set(latest.topicsGranted ?? []),
            topicsRevoked: new Set(latest.topicsRevoked ?? []),
          });
        } else {
          setCategoryPerms({
            categoriesGranted: new Set(),
            categoriesRevoked: new Set(),
            topicsGranted: new Set(),
            topicsRevoked: new Set(),
          });
        }
        setIsLoadingCatPerms(false);
      });
  }, [selectedCategoryId, resolvedParams.userId, activeTab]);

  // ── Save global permissions ───────────────────────────────────────────
  const handleSaveGlobal = async () => {
    setIsSavingGlobal(true);
    const perms = Array.from(selectedGlobalPerms);
    const res = await usersApi.setGlobalPermissions(
      resolvedParams.userId,
      perms,
    );
    setIsSavingGlobal(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setCurrentGlobalPerms(perms);
      setToast({
        message: 'Global permissions updated successfully',
        type: 'success',
      });
    }
  };

  const handleRevokeAllGlobal = async () => {
    if (!window.confirm('Revoke ALL global permissions for this user?')) return;
    setIsSavingGlobal(true);
    const res = await usersApi.revokeAllGlobalPermissions(
      resolvedParams.userId,
    );
    setIsSavingGlobal(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setCurrentGlobalPerms([]);
      setSelectedGlobalPerms(new Set());
      setToast({ message: 'All global permissions revoked', type: 'success' });
    }
  };

  const toggleGlobalPerm = (perm: string) => {
    setSelectedGlobalPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  // ── Category permission helpers ───────────────────────────────────────
  const getCatPermState = (
    perm: string,
    grantedSet: Set<string>,
    revokedSet: Set<string>,
  ): PermissionState => {
    if (grantedSet.has(perm)) return 'granted';
    if (revokedSet.has(perm)) return 'revoked';
    return 'none';
  };

  const setCatPermState = (
    type: 'categories' | 'topics',
    perm: string,
    state: PermissionState,
  ) => {
    setCategoryPerms((prev) => {
      const grantedKey = `${type}Granted` as keyof typeof prev;
      const revokedKey = `${type}Revoked` as keyof typeof prev;
      const newGranted = new Set(prev[grantedKey]);
      const newRevoked = new Set(prev[revokedKey]);

      newGranted.delete(perm);
      newRevoked.delete(perm);

      if (state === 'granted') newGranted.add(perm);
      else if (state === 'revoked') newRevoked.add(perm);

      return {
        ...prev,
        [grantedKey]: newGranted,
        [revokedKey]: newRevoked,
      };
    });
  };

  const handleSaveCategoryPerms = async () => {
    if (!selectedCategoryId) return;
    setIsSavingCatPerms(true);
    const res = await usersApi.setCategoryPermissions(
      resolvedParams.userId,
      selectedCategoryId,
      {
        categoriesGranted: Array.from(categoryPerms.categoriesGranted),
        categoriesRevoked: Array.from(categoryPerms.categoriesRevoked),
        topicsGranted: Array.from(categoryPerms.topicsGranted),
        topicsRevoked: Array.from(categoryPerms.topicsRevoked),
      },
    );
    setIsSavingCatPerms(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setToast({ message: 'Category permissions saved', type: 'success' });
    }
  };

  const handleRevokeCategoryPerms = async () => {
    if (!selectedCategoryId) return;
    if (
      !window.confirm(
        'Remove all category permissions for this user in this category?',
      )
    )
      return;
    setIsSavingCatPerms(true);
    const res = await usersApi.revokeCategoryPermissions(
      resolvedParams.userId,
      selectedCategoryId,
    );
    setIsSavingCatPerms(false);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setCategoryPerms({
        categoriesGranted: new Set(),
        categoriesRevoked: new Set(),
        topicsGranted: new Set(),
        topicsRevoked: new Set(),
      });
      setToast({ message: 'Category permissions revoked', type: 'success' });
    }
  };

  // ── Handle ban/unban ──────────────────────────────────────────────────
  const handleBan = async () => {
    if (!window.confirm('Ban this user?')) return;
    const res = await usersApi.banUser(resolvedParams.userId);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setTargetUser((u) => (u ? { ...u, isBanned: true } : u));
      setToast({ message: 'User banned', type: 'success' });
    }
  };

  const handleUnban = async () => {
    if (!window.confirm('Unban this user?')) return;
    const res = await usersApi.unbanUser(resolvedParams.userId);
    if (res.error) {
      setToast({ message: res.error, type: 'error' });
    } else {
      setTargetUser((u) => (u ? { ...u, isBanned: false } : u));
      setToast({ message: 'User unbanned', type: 'success' });
    }
  };

  // ── Permission badge component ────────────────────────────────────────
  const PermToggle = ({
    state,
    onChange,
  }: {
    state: PermissionState;
    onChange: (s: PermissionState) => void;
  }) => {
    const cycle: PermissionState[] = ['none', 'granted', 'revoked'];
    const next = cycle[(cycle.indexOf(state) + 1) % cycle.length];
    return (
      <button
        onClick={() => onChange(next)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          state === 'granted'
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : state === 'revoked'
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {state === 'granted' ? (
          <CheckCircle className="w-3 h-3" />
        ) : state === 'revoked' ? (
          <XCircle className="w-3 h-3" />
        ) : (
          <div className="w-3 h-3 rounded-full border border-gray-400" />
        )}
        {state === 'none'
          ? 'Inherit'
          : state.charAt(0).toUpperCase() + state.slice(1)}
      </button>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (!isAdmin) return null;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-40 bg-white rounded-xl mb-6" />
            <div className="h-96 bg-white rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const globalPermGroups = GLOBAL_PERMISSIONS.reduce(
    (acc, p) => {
      if (!acc[p.group]) acc[p.group] = [];
      acc[p.group].push(p);
      return acc;
    },
    {} as Record<string, (typeof GLOBAL_PERMISSIONS)[number][]>,
  );

  const hasUnsavedGlobalChanges =
    JSON.stringify([...selectedGlobalPerms].sort()) !==
    JSON.stringify([...currentGlobalPerms].sort());

  const rootId = categoriesApi.getRootId(categories);
  const displayCategories = categories.filter((c) => c.id !== rootId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push(`/client/${resolvedParams.userId}`)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </button>

          {/* User header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {targetUser.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-2xl font-bold">
                      {targetUser.username}
                    </h1>
                    {targetUser.isBanned && (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        Banned
                      </span>
                    )}
                    {targetUser.isAdmin && (
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Admin
                      </span>
                    )}
                    {currentGlobalPerms.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {currentGlobalPerms.length} global perms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    User ID:{' '}
                    <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">
                      {resolvedParams.userId}
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {!targetUser.isBanned ? (
                  <button
                    onClick={handleBan}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    <BanIcon className="w-4 h-4" />
                    Ban User
                  </button>
                ) : (
                  <button
                    onClick={handleUnban}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Unban User
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
                activeTab === 'global'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              Global Permissions
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
                activeTab === 'category'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Category Permissions
            </button>
          </div>

          {/* ── Global Permissions Tab ── */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Platform-wide permissions
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    These permissions apply globally across the entire platform.
                    Only grant what is necessary. Super-admin users (with
                    BYPASS_HIERARCHY) cannot be restricted by other admins.
                  </p>
                </div>
              </div>

              {isLoadingGlobal ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-xl border" />
                  ))}
                </div>
              ) : (
                Object.entries(globalPermGroups).map(([group, perms]) => (
                  <div
                    key={group}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-semibold text-gray-800">{group}</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {perms.map((perm) => {
                        const isGranted = selectedGlobalPerms.has(perm.value);
                        const wasGranted = currentGlobalPerms.includes(
                          perm.value,
                        );
                        const changed = isGranted !== wasGranted;
                        return (
                          <div
                            key={perm.value}
                            className={`flex items-center justify-between px-6 py-4 transition ${
                              changed ? 'bg-yellow-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900">
                                  {perm.label}
                                </span>
                                {changed && (
                                  <span className="text-xs text-amber-600 font-medium">
                                    changed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {perm.desc}
                              </p>
                              <code className="text-xs text-gray-400 font-mono">
                                {perm.value}
                              </code>
                            </div>
                            <div className="flex items-center gap-3">
                              {wasGranted && (
                                <span className="text-xs text-green-600 font-medium">
                                  Currently active
                                </span>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={isGranted}
                                  onChange={() => toggleGlobalPerm(perm.value)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Action bar */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadGlobalPerms}
                    disabled={isLoadingGlobal}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoadingGlobal ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                  {hasUnsavedGlobalChanges && (
                    <span className="text-sm text-amber-600 font-medium">
                      You have unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRevokeAllGlobal}
                    disabled={isSavingGlobal || currentGlobalPerms.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revoke All
                  </button>
                  <button
                    onClick={handleSaveGlobal}
                    disabled={isSavingGlobal || !hasUnsavedGlobalChanges}
                    className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingGlobal ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Category Permissions Tab ── */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Per-category permissions
                  </p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    These permissions override the category defaults for this
                    specific user. &quot;Inherit&quot; means the category
                    default applies. &quot;Granted&quot; explicitly allows the
                    action. &quot;Revoked&quot; explicitly denies it.
                  </p>
                </div>
              </div>

              {/* Category selector */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="">Choose a category…</option>
                  {displayCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                      {cat.parent
                        ? ` (${categories.find((c) => c.id === cat.parent)?.title ?? ''})`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryId && (
                <>
                  {isLoadingCatPerms ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-64 bg-white rounded-xl border" />
                      <div className="h-64 bg-white rounded-xl border" />
                    </div>
                  ) : (
                    <>
                      {/* Category-level permissions */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-semibold text-gray-800">
                            Category Management Permissions
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Controls what this user can do with categories
                          </p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {CATEGORY_PERMISSIONS.map((perm) => {
                            const state = getCatPermState(
                              perm.value,
                              categoryPerms.categoriesGranted,
                              categoryPerms.categoriesRevoked,
                            );
                            return (
                              <div
                                key={perm.value}
                                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition"
                              >
                                <div className="flex-1 min-w-0 mr-4">
                                  <p className="text-sm font-medium text-gray-900">
                                    {perm.label}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {perm.desc}
                                  </p>
                                </div>
                                <PermToggle
                                  state={state}
                                  onChange={(s) =>
                                    setCatPermState('categories', perm.value, s)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Topic/Task permissions */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-semibold text-gray-800">
                            Task &amp; Topic Permissions
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Controls what this user can do with tasks inside
                            this category
                          </p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {TOPIC_PERMISSIONS.map((perm) => {
                            const state = getCatPermState(
                              perm.value,
                              categoryPerms.topicsGranted,
                              categoryPerms.topicsRevoked,
                            );
                            return (
                              <div
                                key={perm.value}
                                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition"
                              >
                                <div className="flex-1 min-w-0 mr-4">
                                  <p className="text-sm font-medium text-gray-900">
                                    {perm.label}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {perm.desc}
                                  </p>
                                </div>
                                <PermToggle
                                  state={state}
                                  onChange={(s) =>
                                    setCatPermState('topics', perm.value, s)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action bar */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Editing permissions for category:{' '}
                          <span className="font-semibold text-gray-900">
                            {
                              categories.find(
                                (c) => c.id === selectedCategoryId,
                              )?.title
                            }
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleRevokeCategoryPerms}
                            disabled={isSavingCatPerms}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove All
                          </button>
                          <button
                            onClick={handleSaveCategoryPerms}
                            disabled={isSavingCatPerms}
                            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isSavingCatPerms ? 'Saving…' : 'Save Permissions'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
