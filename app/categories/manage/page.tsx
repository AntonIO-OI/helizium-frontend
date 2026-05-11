'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { AlertCircle, X as XIcon } from 'lucide-react';
import CategoriesList from '@/app/components/category/CategoriesList';
import Link from 'next/link';
import { categoriesApi, Category } from '@/app/lib/api/categories';
import { useAuth } from '@/app/lib/hooks/useAuth';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && !isAdmin) {
      setShowAdminModal(true);
    }
    if (!authLoading && isAdmin) {
      categoriesApi.listAllCategories().then((cats) => {
        setCategories(cats);
        setIsLoading(false);
      });
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleCategoryDeleted = () => {
    categoriesApi.listAllCategories().then(setCategories);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            {isAdmin && (
              <Link
                href="/category/create"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Create Category
              </Link>
            )}
          </div>
          {isAdmin && (
            <CategoriesList
              categories={categories}
              onCategoryDeleted={handleCategoryDeleted}
            />
          )}
        </div>
      </main>
      <Footer />

      {showAdminModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Admin Access Required</h2>
              </div>
              <button onClick={() => router.push('/')}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600">
              Only administrators can access this page.
            </p>
            <button
              className="w-full bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition"
              onClick={() => router.push('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
