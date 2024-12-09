import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  return (
    <AuthLayout 
      title="Login"
      description="Log in to your Helizium account and enjoy seamless payments powered by Ethereum."
    >
      <InputField
        label="Login or Email"
        type="text"
        id="loginOrEmail"
        placeholder="Enter your login or email"
        required
      />
      <InputField
        label="Password"
        type="password"
        id="password"
        placeholder="Enter your password"
        required
      />

      <Captcha />

      <div className="mb-4 sm:mb-6 text-right">
        <Link href="/forgot-password" className="text-blue-500 hover:underline text-sm sm:text-base">
          Forgot password?
        </Link>
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-black text-white py-2.5 sm:py-3 rounded-md hover:bg-gray-800 transition text-sm sm:text-base"
      >
        Sign In
      </button>
      
      <p className="text-center mt-4 sm:mt-6 text-sm sm:text-base">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-black font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
