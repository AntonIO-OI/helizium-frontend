'use client';

import { LucideIcon } from 'lucide-react';

interface ProfileButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export default function ProfileButton({ 
  label, 
  onClick, 
  variant = 'primary',
  icon: Icon,
  fullWidth = false 
}: ProfileButtonProps) {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200";
  const widthClass = fullWidth ? "w-full" : "";
  
  const variantClasses = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
} 