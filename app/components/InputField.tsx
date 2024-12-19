import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  id: string;
  label?: string;
  type: string;
  placeholder: string;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
  error?: string | null;
}

export default function InputField({
  id,
  label,
  type,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  validate,
  error,
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const validationError = validate && value ? validate(value) : error;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className="mb-6 relative">
      {label && (
        <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          id={id}
          name={name || id}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
            validationError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-black'
          }`}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={handleChange}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      {validationError && (
        <p className="text-red-500 text-sm mt-1">{validationError}</p>
      )}
    </div>
  );
}
