'use client';

import { AssistantModal } from '@assistant-ui/react';
import { useEffect, useState } from 'react';
import { authApi } from '../lib/api/auth';

export default function ChatModal() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    authApi.info().then((res) => {
      if (
        res.data &&
        res.data.limits !== 'USER_BANNED' &&
        res.data.limits !== 'EMAIL_NOT_CONFIRMED'
      ) {
        setAllowed(true);
      }
    });
  }, []);

  if (!allowed) return null;
  return <AssistantModal />;
}
