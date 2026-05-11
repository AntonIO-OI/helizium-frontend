'use client';

import type { ReactNode } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';

const HeliziumModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    const bodyText =
      typeof document !== 'undefined'
        ? document.body.innerText.slice(0, 3000)
        : '';

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          system: `You are the Helizium platform assistant. Help users with tasks, categories, freelancing, and Ethereum payments. Current page context: ${bodyText}`,
          messages: messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
              role: m.role,
              content:
                m.role === 'user'
                  ? typeof m.content === 'string'
                    ? m.content
                    : (m.content as any[])
                        .map((c: any) => c.text || '')
                        .join('')
                  : typeof m.content === 'string'
                    ? m.content
                    : (m.content as any[])[0]?.text || '',
            })),
        }),
        signal: abortSignal,
      },
    );

    const data = await response.json();
    const text =
      data.content?.[0]?.text || 'Sorry, I could not generate a response.';

    return { content: [{ type: 'text', text }] };
  },
};

function LLMProviderInner({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime(HeliziumModelAdapter);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export default function LLMRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <LLMProviderInner>{children}</LLMProviderInner>;
}
