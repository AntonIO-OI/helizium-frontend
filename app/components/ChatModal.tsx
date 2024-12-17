import {
  AssistantModal,
  ContentPart,
  useEdgeRuntime,
} from '@assistant-ui/react';
import { useEffect, useState } from 'react';
import { TextContentPartProvider } from '@assistant-ui/react';

export default function ChatModal() {


  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((user: { id: number }) => user.id === +userId);
      if (user) {
        setIsAuthorized(true);
      }
    }
  });

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <AssistantModal></AssistantModal>
    </>
  );
}
