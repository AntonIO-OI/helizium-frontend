"use client";

import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatModal from './components/ChatModal';

export default function Home() {
  const [showScroll, setShowScroll] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight max-w-4xl mt-16 sm:mt-22 mb-4 sm:mb-6">
          Revolutionizing Payments with{' '}
          <span className="text-black underline">Ethereum</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          Welcome to Helizium, the ultimate freelancing platform powered by
          Ethereum. Fast, secure, and decentralized transactions redefine how
          you work and earn.
        </p>
        <div className="flex gap-6">
          <button className="px-8 py-4 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 transition">
            Get Started
          </button>
          <button className="px-8 py-4 bg-gray-200 text-black rounded-lg shadow-lg hover:bg-gray-300 transition">
            Learn More
          </button>
        </div>
      </main>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Low Transaction Fees',
              description:
                'Helizium ensures minimal fees, making your earnings more rewarding.',
              icon: '💰',
            },
            {
              title: 'Powered by Ethereum',
              description:
                'Enjoy secure and decentralized payments for every project.',
              icon: '⚡',
            },
            {
              title: 'MFA Authentication',
              description:
                'Protect your account with advanced security options.',
              icon: '🔒',
            },
            {
              title: 'Blockchain Technology',
              description:
                'Your payments are securely managed using blockchain technology.',
              icon: '🔗',
            },
            {
              title: '24/7 Support',
              description:
                'Our team is available around the clock to assist you with any issues.',
              icon: '📞',
            },
            {
              title: 'Global Reach',
              description:
                'Connect with clients and freelancers from all over the world.',
              icon: '🌍',
            },
            {
              title: 'User Ratings',
              description:
                'Rate and review clients and freelancers to build trust in the community.',
              icon: '⭐',
            },
            {
              title: 'API Tokens',
              description:
                'Easily integrate with Helizium using secure API tokens.',
              icon: '🔑',
            },
          ].map((feature, idx) => (
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
            Why Choose Helizium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Innovative Technology</h3>
              <p className="text-gray-600">
                We leverage the latest blockchain technology to ensure your
                transactions are secure and efficient.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">
                User-Friendly Interface
              </h3>
              <p className="text-gray-600">
                Our platform is designed with you in mind, offering an intuitive
                and seamless experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100">
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
                  "Sign up and verify your identity to start using Helizium's services.",
              },
              {
                step: '2',
                title: 'Connect Your Wallet',
                description:
                  'Link your Ethereum wallet to enable secure transactions.',
              },
              {
                step: '3',
                title: 'Start Working',
                description:
                  'Find projects or post your own and begin earning with crypto payments.',
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
                  'The security and speed of transactions are unmatched. Highly recommended!',
                author: 'Michael Chen',
                role: 'Web Developer',
              },
              {
                quote:
                  'Finally, a platform that understands the needs of modern freelancers.',
                author: 'Emma Williams',
                role: 'Content Writer',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-lg shadow-lg">
                <p className="text-gray-600 mb-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-gray-500">{testimonial.role}</p>
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
            Join thousands of freelancers who trust Helizium for secure crypto
            payments.
          </p>
          <button className="px-8 py-4 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition">
            Get Started Now
          </button>
        </div>
      </section>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
      <ChatModal />
      <Footer />
    </div>
  );
}
