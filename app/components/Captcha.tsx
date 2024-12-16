'use client';

import Image from 'next/image';
import { LucideRefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CAPTHCA_API } from '../constants/api';
import InputField from './InputField';

interface CaptchaProps {
  path: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';
  onCaptchaLoaded?: (captchaId: string | null) => void;
}

interface CaptchaResponse {
  id: string;
  data: string;
}

export default function Captcha({
  path,
  method,
  onCaptchaLoaded,
}: CaptchaProps) {
  const setCaptchaId = useState<string | null>(null)[1]; // State for Captcha ID
  const [captchaData, setCaptchaData] = useState<string | null>(null); // State for Captcha Data
  const [captchaType, setCaptchaType] = useState<string>('string'); // Default captcha type

  const fetchCaptcha = useCallback(async () => {
    const response = await fetch(
      `${CAPTHCA_API}?type=${captchaType}&path=${path}&method=${method}`
    );

    if (response.status === 204) {
      setCaptchaId(null);
      if (onCaptchaLoaded) {
        onCaptchaLoaded(null);
      }

      return;
    }

    if (response.status === 200) {
      const data: CaptchaResponse = await response.json();
      setCaptchaId(data.id);
      setCaptchaData(data.data);
      if (onCaptchaLoaded) {
        onCaptchaLoaded(null);
      }
    }
  }, [captchaType, path, method, setCaptchaId, onCaptchaLoaded]);

  useEffect(() => {
    fetchCaptcha();
  }, [captchaType, fetchCaptcha]);

  const handleRefresh = () => {
    fetchCaptcha();
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
        Captcha
      </label>
      <div className="flex flex-col sm:flex-row items-stretch items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Captcha Image or Audio */}
        <div className="relative w-full sm:w-[265px]">
          {captchaData ? (
            captchaType === 'audio' ? (
              <audio controls src={`${captchaData}`} className="w-full"></audio>
            ) : (
              <Image
                src={`${captchaData}`}
                alt="captcha"
                layout="responsive"
                width={1}
                height={1}
                className="object-cover rounded-md w-full h-auto object-contain rounded-md"
              />
            )
          ) : (
            <p>Captcha not required</p>
          )}
        </div>

        {/* Controls Container */}
        <div className="flex gap-3 sm:gap-4 items-center">
          {/* Refresh Button */}
          <button
            type="button"
            className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center justify-center flex-shrink-0"
            title="Refresh Captcha"
            onClick={handleRefresh}
          >
            <LucideRefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Type Selector */}
          <select
            className="h-10 sm:h-12 px-2 sm:px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base flex-1 sm:flex-initial"
            required
            title="Select Captcha Type"
            value={captchaType}
            onChange={(e) => setCaptchaType(e.target.value)}
          >
            <option value="string">Text</option>
            <option value="math">Math</option>
            <option value="digit">Digits</option>
            <option value="audio">Audio</option>
          </select>
        </div>
      </div>

      {/* Input Field */}
      <InputField
          type="text"
          id="captcha"
          placeholder="Enter captcha value"
          required
        />
    </div>
  );
}


