'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatModal from './components/ChatModal';
import Link from 'next/link';

export default function Home() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const features = [
    {
      title: 'ETH Escrow',
      description: 'Smart contract holds funds until work is approved.',
      icon: '🔒',
    },
    {
      title: 'Ethereum Payments',
      description: 'Secure, decentralized payments via MetaMask.',
      icon: '⚡',
    },
    {
      title: 'MFA Security',
      description: 'Email OTP and TOTP two-factor authentication.',
      icon: '🛡️',
    },
    {
      title: 'API Tokens',
      description: 'Integrate with Helizium using secure API tokens.',
      icon: '🔑',
    },
    {
      title: 'Task Management',
      description: 'Full workflow from posting to completion.',
      icon: '📋',
    },
    {
      title: 'Rating System',
      description: 'Rate freelancers after task completion.',
      icon: '⭐',
    },
    {
      title: 'Private Chat',
      description: 'Real-time messaging between clients and freelancers.',
      icon: '💬',
    },
    {
      title: 'Admin Tools',
      description: 'Reports, bans, and category management.',
      icon: '⚙️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight max-w-4xl mt-16 mb-4">
          Revolutionizing Payments with{' '}
          <span className="text-black underline">Ethereum</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          Welcome to Helizium — the Ethereum-powered freelance platform where
          smart contracts secure every transaction.
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="/signup">
            <button className="px-8 py-4 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 transition">
              Get Started
            </button>
          </Link>
          <Link href="/recent">
            <button className="px-8 py-4 bg-gray-200 text-black rounded-lg shadow-lg hover:bg-gray-300 transition">
              Browse Tasks
            </button>
          </Link>
        </div>
      </main>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 bg-gray-100 text-center rounded-lg shadow-lg transform transition hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            How Helizium Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                description:
                  'Sign up, confirm your email, and set up MFA for maximum security.',
              },
              {
                step: '2',
                title: 'Connect Your Wallet',
                description:
                  'Link MetaMask to enable ETH escrow payments for tasks.',
              },
              {
                step: '3',
                title: 'Post or Take Tasks',
                description:
                  'Clients post tasks with ETH budget. Freelancers apply and get paid automatically on approval.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'Helizium has transformed how I receive payments for my freelance work.',
                author: 'Sarah Johnson',
                role: 'Digital Designer',
              },
              {
                quote:
                  'The smart contract escrow gives me peace of mind. Payments are instant on approval.',
                author: 'Michael Chen',
                role: 'Web Developer',
              },
              {
                quote:
                  'Finally, a platform that understands the needs of modern freelancers.',
                author: 'Emma Williams',
                role: 'Content Writer',
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-lg shadow-lg">
                <p className="text-gray-600 mb-4 italic">
                  &quot;{t.quote}&quot;
                </p>
                <p className="font-bold">{t.author}</p>
                <p className="text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 mb-8">
            Join freelancers who trust Helizium for secure crypto payments.
          </p>
          <Link href="/signup">
            <button className="px-8 py-4 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition">
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition z-40"
        >
          ↑
        </button>
      )}
      <ChatModal />
      <Footer />
    </div>
  );
}
