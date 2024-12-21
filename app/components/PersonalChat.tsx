'use client';

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Check } from 'lucide-react';

export interface Message {
  from: number;
  to: number;
  message: string;
  posted: string;
  read: string | null;
}

interface PersonalChatProps {
  userId: number;
  contactId: number;
  contactUsername: string;
  isVisible: boolean;
  onClose: () => void;
  chatChangedCallback?: () => void;
}

export interface PersonalChatRef {
  getUnseenMessageCount: () => number;
}

const PersonalChat = forwardRef<PersonalChatRef, PersonalChatProps>(
  ({ isVisible, userId, contactId, contactUsername, onClose, chatChangedCallback }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
      if (isVisible) {
        const chatData = localStorage.getItem('personalChat');
        const chatMessages: Message[] = chatData ? JSON.parse(chatData) : [];
        const filteredMessages = chatMessages.filter(
          (msg) =>
            (msg.from === userId && msg.to === contactId) ||
            (msg.from === contactId && msg.to === userId),
        );

        setMessages(filteredMessages);

        let changesCount = 0;
        const updatedMessages = chatMessages.map((msg) => {
          if (msg.to === userId && !msg.read) {
            changesCount++;
            return {
              ...msg,
              read: new Date().toLocaleString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              }),
            };
          }
          return msg;
        });
        localStorage.setItem('personalChat', JSON.stringify(updatedMessages));

        if (changesCount && chatChangedCallback) {
          chatChangedCallback();
        }
      }
    }, [contactId, isVisible, userId, chatChangedCallback]);

    useImperativeHandle(ref, () => ({
      getUnseenMessageCount: () => {
        return messages.filter((msg) => msg.to === userId && !msg.read).length;
      },
    }));

    if (!isVisible) return null;

    const handleSendMessage = () => {
      if (!newMessage.trim()) return;

      const newMsg: Message = {
        from: userId,
        to: contactId,
        message: newMessage,
        posted: new Date().toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
        read: null,
      };

      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);

      const chatData = localStorage.getItem('personalChat');
      const allMessages = chatData ? JSON.parse(chatData) : [];
      localStorage.setItem(
        'personalChat',
        JSON.stringify([...allMessages, newMsg]),
      );

      setNewMessage('');

      if (chatChangedCallback) {
        chatChangedCallback();
      }
    };

    return (
      <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg flex flex-col z-50 transition-transform">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">{contactUsername} private chat</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold leading-none hover:text-blue-300"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-gray-800 text-center mt-2">
              Chat is empty! Write you first message
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] w-auto p-3 rounded-lg ${
                msg.from === userId
                  ? 'bg-blue-500 text-white self-end ml-auto'
                  : 'bg-gray-200 text-gray-800 self-start'
              }`}
            >
              <p className="inline-block">{msg.message}</p>
              <span className="flex items-center justify-end text-xs block text-right">
                {msg.posted}
                {msg.read && msg.from === userId && (
                  <span className="ext-xs text-gray-300 mb-1">
                    <Check className="w-4 h-4 mx-2 inline" />
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Input Container */}
        <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    );
  },
);

PersonalChat.displayName = 'PersonalChat';

export default PersonalChat;
