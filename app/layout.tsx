import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import LLMRuntimeProvider from './LLMRuntimeProvider';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Helizium',
  description: 'Helizium — Ethereum-powered freelance platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <LLMRuntimeProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </LLMRuntimeProvider>
    </ErrorBoundary>
  );
}
