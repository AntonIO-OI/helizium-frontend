import Link from 'next/link';
import { User } from '@/app/types/search';
import { FolderCog } from 'lucide-react';

interface AdminSectionProps {
  user: User;
}

export default function AdminSection({ user }: AdminSectionProps) {
  if (!user.admin) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
      <div className="space-y-3">
        <Link
          href="/categories/manage"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FolderCog className="w-5 h-5" />
          Manage Categories
        </Link>
      </div>
    </div>
  );
} 