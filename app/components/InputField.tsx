interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  name?: string;
}

export default function InputField({
  id,
  label,
  type,
  placeholder,
  required = false,
  name,
}: InputFieldProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block text-gray-700 font-semibold mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name || id}
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
} 