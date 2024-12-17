'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((user: { id: number }) => user.id === +userId);
      if (user) {
        setIsAuthorized(true);
      }
    }
  }, []);

  return (
    <header className="bg-black text-white p-4 sm:p-6">
      <div className="w-full sm:max-w-[90%] lg:max-w-[1200px] mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">
          Helizium
        </h1>

        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <nav className="hidden lg:flex space-x-6 items-center">
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Main Page
          </Link>
          <Link
            href="/recent"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Recent Tasks
          </Link>
          <Link
            href="/search"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Search
          </Link>
          {isAuthorized ? (
            <Link
              href="/profile"
              className="block bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition text-center"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="block bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition text-center"
            >
              Sign In
            </Link>
          )}
        </nav>

        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black lg:hidden shadow-lg z-50">
            <nav className="w-full sm:max-w-[90%] lg:max-w-[1200px] mx-auto p-4 space-y-4">
              <Link
                href="/"
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                Main Page
              </Link>
              <Link
                href="/recent"
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                Recent Tasks
              </Link>
              <Link
                href="/search"
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                Search
              </Link>
              {isAuthorized ? (
                <Link
                  href="/profile"
                  className="block bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition text-center"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block bg-white text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition text-center"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
