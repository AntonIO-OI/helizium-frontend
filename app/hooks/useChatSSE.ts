'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../constants/api';

const WS_URL = process.env.NEXT_PUBLIC_MAIN_WS_URL || 'ws://localhost:3501/chat-ws';

export interface NewMessageEvent {
  id: string; from: string; to: string;
  message: string; postedAt: string;
  readAt: string | null; fromUsername: string;
}
export interface ChatUpdatedEvent { contactId: string; lastMessage: string; }

type NML = (d: NewMessageEvent) => void;
type CUL = (d: ChatUpdatedEvent) => void;

interface Ctx {
  addNewMessageListener: (fn: NML) => () => void;
  addChatUpdatedListener: (fn: CUL) => () => void;
}

const ChatSSEContext = createContext<Ctx | null>(null);

export function ChatSSEProvider({ children }: { children: React.ReactNode }) {
  const newMsg = useRef<Set<NML>>(new Set());
  const chatUpd = useRef<Set<CUL>>(new Set());

  useEffect(() => {
    // Each effect instance has its own local state — Strict Mode safe
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let dead = false;

    async function connect() {
      if (dead || ws) return;

      // 1. Get one-time token from KrakenD (has JWT auth)
      let token: string;
      try {
        const res = await fetch(`${API_BASE_URL}/v1/chat/ws-token`, { credentials: 'include' });
        if (dead) return;
        if (!res.ok) { timer = setTimeout(connect, 8000); return; }
        token = ((await res.json()) as { token: string }).token;
        if (dead) return;
      } catch {
        if (!dead) timer = setTimeout(connect, 8000);
        return;
      }

      // 2. Connect directly to main-service (bypasses KrakenD)
      ws = new WebSocket(WS_URL);

      ws.onopen = () => ws!.send(JSON.stringify({ event: 'auth', data: { token } }));

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data as string) as { type: string; data: unknown };
          if (msg.type === 'new-message')
            newMsg.current.forEach((fn) => fn(msg.data as NewMessageEvent));
          else if (msg.type === 'chat-updated')
            chatUpd.current.forEach((fn) => fn(msg.data as ChatUpdatedEvent));
        } catch { /* ignore */ }
      };

      ws.onerror = () => ws?.close();

      ws.onclose = () => {
        ws = null;
        if (!dead) timer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      dead = true;
      if (timer) clearTimeout(timer);
      ws?.close();
      ws = null;
    };
  }, []);

  const addNewMessageListener = useCallback((fn: NML) => {
    newMsg.current.add(fn);
    return () => newMsg.current.delete(fn);
  }, []);

  const addChatUpdatedListener = useCallback((fn: CUL) => {
    chatUpd.current.add(fn);
    return () => chatUpd.current.delete(fn);
  }, []);

  return React.createElement(ChatSSEContext.Provider, { value: { addNewMessageListener, addChatUpdatedListener } }, children);
}

export function useChatSSE({ onNewMessage, onChatUpdated }: { onNewMessage?: NML; onChatUpdated?: CUL }) {
  const ctx = useContext(ChatSSEContext);
  const nmRef = useRef(onNewMessage);
  nmRef.current = onNewMessage;
  const cuRef = useRef(onChatUpdated);
  cuRef.current = onChatUpdated;

  useEffect(() => {
    if (!ctx) return;
    const unsubs: Array<() => void> = [];
    if (nmRef.current !== undefined)
      unsubs.push(ctx.addNewMessageListener((d) => nmRef.current?.(d)));
    if (cuRef.current !== undefined)
      unsubs.push(ctx.addChatUpdatedListener((d) => cuRef.current?.(d)));
    return () => unsubs.forEach((f) => f());
  }, [ctx]);
}

// Keep these exports for compatibility
export { ChatSSEContext };
