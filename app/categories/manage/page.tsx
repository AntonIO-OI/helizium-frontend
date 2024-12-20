'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getSearchData } from '@/app/utils/storage';
import { getUser } from '@/app/data/mockUsers';
import { AlertCircle, X as XIcon } from 'lucide-react';
import CategoriesList from '@/app/components/category/CategoriesList';
import Link from 'next/link';
import { Category } from '@/app/types/search';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    
    const user = getUser(Number(userId));
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.admin) {
      setShowAdminModal(true);
      return;
    }

    const { categories } = getSearchData();
    setCategories(categories);
  }, [router]);

  const handleCategoryDeleted = () => {
    const { categories } = getSearchData();
    setCategories(categories);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            <Link
              href="/category/create"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Create Category
            </Link>
          </div>
          
          <CategoriesList 
            categories={categories}
            onCategoryDeleted={handleCategoryDeleted}
          />
        </div>
      </main>
      <Footer />

      {showAdminModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Admin Access Required</h2>
              </div>
              <button onClick={() => router.push('/')}>
                <XIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="text-gray-600">Only administrators can access this page.</p>
            <button
              className="w-full bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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