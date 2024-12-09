import Image from 'next/image';
import { LucideRefreshCcw } from 'lucide-react';

interface CaptchaProps {
  onRefresh?: () => void;
  onTypeChange?: (type: string) => void;
  onValueChange?: (value: string) => void;
}

export default function Captcha({ onRefresh }: CaptchaProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
        Captcha
      </label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Captcha Image */}
        <div className="relative w-full sm:w-[265px] h-[60px]">
          <Image
            src={'/captcha.jpg'}
            alt="captcha"
            fill
            className="object-cover rounded-md"
          />
        </div>

        {/* Controls Container */}
        <div className="flex gap-3 sm:gap-4">
          {/* Refresh Button */}
          <button
            type="button"
            className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center justify-center flex-shrink-0"
            title="Refresh Captcha"
            onClick={onRefresh}
          >
            <LucideRefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Type Selector */}
          <select
            className="h-10 sm:h-12 px-2 sm:px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base flex-1 sm:flex-initial"
            required
            title="Select Captcha Type"
          >
            <option value="text">Text</option>
            <option value="math">Math</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
        </div>
      </div>

      {/* Input Field */}
      <input
        type="text"
        className="w-full p-2.5 sm:p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
        placeholder="Enter captcha value"
        required
      />
    </div>
  );
} 