'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
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

export interface CaptchaRef {
  getCaptchaId: () => string | null;
  getCaptchaValue: () => string;
  refreshCaptcha: () => void;
}

export default React.memo(
  forwardRef<CaptchaRef, CaptchaProps>(function Captcha(
    { path, method, onCaptchaLoaded },
    ref,
  ) {
    const [captchaId, setCaptchaId] = useState<string | null>(null);
    const [captchaData, setCaptchaData] = useState<string | null>(null);
    const [captchaValue, setCaptchaValue] = useState<string>('');
    const [captchaType, setCaptchaType] = useState<string>('string');

    const fetchCaptcha = useCallback(async () => {
      const response = await fetch(
        `${CAPTHCA_API}?type=${captchaType}&path=${path}&method=${method}`,
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
      setCaptchaValue('');
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCaptchaType(e.target.value);
      setCaptchaValue('');
    }

    useImperativeHandle(ref, () => ({
      getCaptchaId: () => captchaId,
      getCaptchaValue: () => captchaValue,
      refreshCaptcha: () => handleRefresh(),
    }));

    return (
      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
          Captcha
        </label>
        <div className="flex flex-col sm:flex-row items-stretch items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="relative w-full sm:w-[265px]">
            {captchaId && captchaData ? (
              captchaType === 'audio' ? (
                <audio
                  controls
                  src={`${captchaData}`}
                  className="w-full"
                ></audio>
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

          {captchaId && captchaData ? (
            <div className="flex gap-3 sm:gap-4 items-center">
              <button
                type="button"
                className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center justify-center flex-shrink-0"
                title="Refresh Captcha"
                onClick={handleRefresh}
              >
                <LucideRefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <select
                className="h-10 sm:h-12 px-2 sm:px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base flex-1 sm:flex-initial"
                required
                title="Select Captcha Type"
                value={captchaType}
                onChange={handleTypeChange}
              >
                <option value="string">Text</option>
                <option value="math">Math</option>
                <option value="digit">Digits</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          ) : null}
        </div>

        {captchaId && captchaData ? (
          <InputField
            type="text"
            id="captcha"
            placeholder="Enter captcha value"
            value={captchaValue}
            onChange={(e) => setCaptchaValue(e.target.value)}
            required
          />
        ) : null}
      </div>
    );
  }),
);
