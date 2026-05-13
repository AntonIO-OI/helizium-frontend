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

    const formattedMessages = [
      {
        role: 'system',
        content: `You are the Helizium platform assistant. Help users with tasks, categories, freelancing, and Ethereum payments. Do not use any html or markdown text formatting. ONLY PLAIN TEXT. Current page context: ${bodyText}`,
      },
      ...messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content:
            m.role === 'user'
              ? typeof m.content === 'string'
                ? m.content
                : (m.content as any[]).map((c: any) => c.text || '').join('')
              : typeof m.content === 'string'
                ? m.content
                : (m.content as any[])[0]?.text || '',
        })),
    ];

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: formattedMessages,
        }),
        signal: abortSignal,
      },
    );

    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

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
