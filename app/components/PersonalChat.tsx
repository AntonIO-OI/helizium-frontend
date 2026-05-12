'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { chatApi, Message } from '../lib/api/chat';
import { useChatSSE, NewMessageEvent } from '../hooks/useChatSSE';

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

const SCROLL_THRESHOLD = 80; // px from bottom to be considered "at bottom"

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
    const [newIncomingCount, setNewIncomingCount] = useState(0);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
      setNewIncomingCount(0);
      setShowScrollBtn(false);
      isAtBottomRef.current = true;
    }, []);

    const handleScroll = useCallback(() => {
      const el = scrollAreaRef.current;
      if (!el) return;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom <= SCROLL_THRESHOLD;
      isAtBottomRef.current = atBottom;
      setShowScrollBtn(!atBottom);
      if (atBottom) setNewIncomingCount(0);
    }, []);

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

    useChatSSE({
      onNewMessage: useCallback(
        (data: NewMessageEvent) => {
          if (!isVisible) return;
          if (data.from !== contactId && data.to !== contactId) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          // Only count incoming messages from the other user as "new unread"
          if (data.from === contactId) {
            if (isAtBottomRef.current) {
              // User sees it — just smooth-scroll
              setTimeout(() => scrollToBottom('smooth'), 30);
            } else {
              setNewIncomingCount((n) => n + 1);
              setShowScrollBtn(true);
            }
          }
          if (chatChangedCallback) chatChangedCallback();
        },
        [contactId, isVisible, chatChangedCallback, scrollToBottom],
      ),
    });

    // Initial load: scroll instantly to bottom after messages are set
    useEffect(() => {
      if (!isVisible) return;
      fetchMessages().then(() => {
        setTimeout(() => scrollToBottom('instant'), 50);
      });
      chatApi.markRead(contactId);
      setNewIncomingCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, contactId]);

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
        setMessages((prev) =>
          prev.some((m) => m.id === res.data!.id)
            ? prev
            : [...prev, res.data!],
        );
        setNewMessage('');
        if (chatChangedCallback) chatChangedCallback();
        setTimeout(() => scrollToBottom('smooth'), 30);
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

        {/* Messages area — position:relative so the scroll button anchors to it */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-4 space-y-4"
          >
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
            {/* Sentinel element for scrollIntoView */}
            <div ref={bottomRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5" />
              {newIncomingCount > 0 && (
                <span className="absolute -top-2 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {newIncomingCount > 99 ? '99+' : newIncomingCount}
                </span>
              )}
            </button>
          )}
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
