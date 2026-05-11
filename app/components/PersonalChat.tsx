'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Check } from 'lucide-react';
import { chatApi, Message } from '../lib/api/chat';

interface PersonalChatProps {
  contactId: string;
  contactUsername: string;
  isVisible: boolean;
  readonly: boolean;
  onClose: () => void;
  chatChangedCallback?: () => void;
}

export interface PersonalChatRef {
  getUnseenMessageCount: () => number;
}

const PersonalChat = forwardRef<PersonalChatRef, PersonalChatProps>(
  (
    {
      isVisible,
      contactId,
      contactUsername,
      readonly,
      onClose,
      chatChangedCallback,
    },
    ref,
  ) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unseenCount, setUnseenCount] = useState(0);

    const fetchMessages = useCallback(async () => {
      if (!isVisible) return;
      const res = await chatApi.getMessages(contactId);
      if (res.data) {
        setMessages(res.data);
        const unread = res.data.filter(
          (m) => m.to !== contactId && !m.readAt,
        ).length;
        setUnseenCount(unread);
        if (chatChangedCallback) chatChangedCallback();
      }
    }, [contactId, isVisible, chatChangedCallback]);

    useEffect(() => {
      if (!isVisible) return;
      fetchMessages();
      chatApi.markRead(contactId);

      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }, [isVisible, fetchMessages, contactId]);

    useImperativeHandle(ref, () => ({
      getUnseenMessageCount: () => unseenCount,
    }));

    if (!isVisible) return null;

    const handleSend = async () => {
      if (!newMessage.trim()) return;
      setIsLoading(true);
      const res = await chatApi.sendMessage(contactId, newMessage.trim());
      setIsLoading(false);
      if (res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setNewMessage('');
        if (chatChangedCallback) chatChangedCallback();
      }
    };

    return (
      <div className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-lg flex flex-col z-50">
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {contactUsername} — Private Chat
          </h2>
          <button
            onClick={onClose}
            className="text-xl font-bold hover:text-blue-300"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center mt-2">
              {readonly ? 'Chat is empty' : 'No messages yet. Say hello!'}
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] w-auto p-3 rounded-lg ${
                msg.from === contactId
                  ? 'bg-gray-200 text-gray-800 self-start'
                  : 'bg-blue-500 text-white self-end ml-auto'
              }`}
            >
              <p>{msg.message}</p>
              <span className="flex items-center justify-end text-xs mt-1 opacity-70">
                {new Date(msg.postedAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {msg.readAt && msg.from !== contactId && (
                  <Check className="w-4 h-4 ml-1 inline" />
                )}
              </span>
            </div>
          ))}
        </div>

        {!readonly && (
          <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !newMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
      </div>
    );
  },
);

PersonalChat.displayName = 'PersonalChat';

export default PersonalChat;
