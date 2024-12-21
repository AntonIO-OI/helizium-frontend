'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PersonalChat, { Message } from './PersonalChat';
import { User } from '../types/search';

interface ChatPreview {
  contactId: number;
  lastMessage: string;
  lastMessageTime: string;
  contactName: string;
  highlight: boolean;
}

interface ChatHistoryProps {
  userId: number;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ userId }) => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedContact, setSelectedContact] = useState<number>(0);
  const [selectedContactUsername, setSelectedContactUsername] =
    useState<string>('');
  const [showChatModal, setShowChatModal] = useState(false);

  const refreshData = useCallback(() => {
    const chatData = localStorage.getItem('personalChat');
    const usersData = localStorage.getItem('users');

    if (chatData && usersData) {
      const messages: Message[] = JSON.parse(chatData);
      const users: User[] = JSON.parse(usersData);

      const userChats = messages
        .filter(
          (msg: { from: number; to: number }) =>
            msg.from === userId || msg.to === userId,
        )
        .reduce((acc: Record<number, ChatPreview>, msg: Message) => {
          const contactId = msg.from === userId ? msg.to : msg.from;
          const contact = users.find((user) => user.id === contactId);

          if (contact && !contact.banned) {
            acc[contactId] = {
              contactId,
              contactName: contact.username,
              lastMessage: msg.message,
              lastMessageTime: msg.posted,
              highlight: !msg.read && msg.from === contactId,
            };
          }

          return acc;
        }, {});

      const chatsArray: ChatPreview[] = Object.values(userChats);

      chatsArray.sort((a, b) => {
        if (a.highlight !== b.highlight) {
          return b.highlight ? 1 : -1;
        }

        return b.lastMessageTime.localeCompare(a.lastMessageTime);
      });

      setChats(chatsArray);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (chats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PersonalChat
        isVisible={showChatModal}
        userId={userId}
        contactId={selectedContact}
        contactUsername={selectedContactUsername}
        onClose={() => setShowChatModal(false)}
        chatChangedCallback={() => refreshData()}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Chat History</h2>

        {chats.map((chat) => (
          <div
            key={chat.contactId}
            className="flex justify-between items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              refreshData();
              setSelectedContact(chat.contactId);
              setSelectedContactUsername(chat.contactName);
              setShowChatModal(true);
            }}
          >
            <div>
              <h3
                className={`text-lg font-medium ${
                  chat.highlight && 'text-red-600'
                }`}
              >
                {chat.contactName}
              </h3>
              <p className="text-gray-500 text-sm truncate">
                {chat.lastMessage}
              </p>
            </div>
            <span className="text-gray-400 text-xs">
              {chat.lastMessageTime}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
