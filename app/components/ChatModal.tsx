import { AssistantModal } from '@assistant-ui/react';
import { useEffect, useState } from 'react';

export default function ChatModal() {
  const [chatBotAccessAllowed, setChatBotAccess] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((user: { id: number }) => user.id === +userId);
      if (user && user.emailConfirmed) {
        setChatBotAccess(true);
      }
    }
  });

  if (!chatBotAccessAllowed) {
    return null;
  }

  return <AssistantModal></AssistantModal>;
}
