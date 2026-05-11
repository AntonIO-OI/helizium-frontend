'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { LucideRefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import InputField from './InputField';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaType, setCaptchaType] = useState('string');
    const [notRequired, setNotRequired] = useState(false);

    const fetchCaptcha = useCallback(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/captcha?type=${captchaType}&path=${encodeURIComponent(path)}&method=${method}`,
        );

        if (response.status === 204) {
          // Captcha not required for this endpoint
          setNotRequired(true);
          setCaptchaId(null);
          setCaptchaData(null);
          if (onCaptchaLoaded) onCaptchaLoaded(null);
          return;
        }

        if (response.status === 200) {
          const data: CaptchaResponse = await response.json();
          setNotRequired(false);
          setCaptchaId(data.id);
          setCaptchaData(data.data);
          if (onCaptchaLoaded) onCaptchaLoaded(data.id);
        }
      } catch {
        // If captcha server is unavailable, bypass silently
        setNotRequired(true);
      }
    }, [captchaType, path, method, onCaptchaLoaded]);

    useEffect(() => {
      fetchCaptcha();
    }, [fetchCaptcha]);

    const handleRefresh = () => {
      fetchCaptcha();
      setCaptchaValue('');
    };

    useImperativeHandle(ref, () => ({
      getCaptchaId: () => captchaId,
      getCaptchaValue: () => captchaValue,
      refreshCaptcha: handleRefresh,
    }));

    if (notRequired) {
      return (
        <div className="mb-4">
          <p className="text-sm text-gray-400 italic">Captcha not required</p>
        </div>
      );
    }

    if (!captchaId || !captchaData) {
      return (
        <div className="mb-4">
          <div className="h-16 bg-gray-100 animate-pulse rounded-md" />
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2 text-sm">
          Captcha
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          <div className="relative w-full sm:w-64">
            {captchaType === 'audio' ? (
              <audio controls src={captchaData} className="w-full" />
            ) : (
              <Image
                src={captchaData}
                alt="captcha"
                width={265}
                height={80}
                className="rounded-md border border-gray-200"
              />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="h-10 px-3 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center"
              onClick={handleRefresh}
              title="Refresh Captcha"
            >
              <LucideRefreshCcw className="w-4 h-4" />
            </button>
            <select
              className="h-10 px-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              value={captchaType}
              onChange={(e) => {
                setCaptchaType(e.target.value);
                setCaptchaValue('');
              }}
              title="Captcha type"
            >
              <option value="string">Text</option>
              <option value="math">Math</option>
              <option value="digit">Digits</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
        <InputField
          type="text"
          id="captcha"
          placeholder="Enter captcha answer"
          value={captchaValue}
          onChange={(e) => setCaptchaValue(e.target.value)}
          required
        />
      </div>
    );
  }),
);
