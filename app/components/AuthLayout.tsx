import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-2/5 bg-black text-white flex flex-col items-center justify-center p-8 lg:p-10 min-h-[200px] lg:min-h-screen">
        <Link
          href="/"
          className="text-3xl lg:text-5xl font-extrabold mb-4 lg:mb-6 hover:text-gray-300 transition"
        >
          Helizium
        </Link>
        <p className="text-gray-300 text-center max-w-sm text-sm lg:text-base">
          {description}
        </p>
      </div>

      <div className="w-full lg:w-3/5 bg-white flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg bg-gray-50 shadow-lg rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-8 text-center text-black">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
} 