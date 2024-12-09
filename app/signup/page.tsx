import Link from 'next/link';
import InputField from '../components/InputField';
import Captcha from '../components/Captcha';
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  return (
    <AuthLayout 
      title="Sign Up"
      description="Join Helizium and unlock the potential of secure, blockchain-powered freelancing."
    >
      <InputField
        label="Username"
        type="text"
        id="username"
        placeholder="Enter your username"
        required
      />
      <InputField
        label="Email"
        type="email"
        id="email"
        placeholder="Enter your email"
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

      <button
        type="submit"
        className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition mb-4"
      >
        Sign Up
      </button>
      
      <p className="text-center text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-black font-semibold hover:underline"
        >
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}
