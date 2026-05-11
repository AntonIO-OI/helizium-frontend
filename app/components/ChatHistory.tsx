'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PersonalChat from './PersonalChat';
import { chatApi, ChatPreview } from '../lib/api/chat';

interface ChatHistoryProps {
  userId: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

  const refreshChats = useCallback(async () => {
    const res = await chatApi.getChats();
    if (res.data) setChats(res.data);
  }, []);

  useEffect(() => {
    refreshChats();
    const interval = setInterval(refreshChats, 10000);
    return () => clearInterval(interval);
  }, [refreshChats]);

  if (chats.length === 0) return null;

  return (
    <div className="space-y-4">
      <PersonalChat
        isVisible={showChat}
        contactId={selectedContactId}
        contactUsername={selectedUsername}
        onClose={() => setShowChat(false)}
        chatChangedCallback={refreshChats}
        readonly={false}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Chat History</h2>
        {chats.map((chat) => (
          <div
            key={chat.contactId}
            className="flex justify-between items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => {
              setSelectedContactId(chat.contactId);
              setSelectedUsername(chat.contactUsername);
              setShowChat(true);
              refreshChats();
            }}
          >
            <div>
              <h3
                className={`text-lg font-medium ${chat.unreadCount > 0 ? 'text-red-600' : ''}`}
              >
                {chat.contactUsername}
                {chat.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {chat.unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-gray-500 text-sm truncate max-w-xs">
                {chat.lastMessage}
              </p>
            </div>
            <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
              {new Date(chat.lastMessageTime).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
