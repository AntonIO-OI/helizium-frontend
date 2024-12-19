'use client';

import type { ReactNode } from 'react';
import {
  AssistantRuntimeProvider,
  ThreadMessage,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';

interface MessageContent {
  text: string;
}

const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    const webPageContent = getDynamicWebPageContent();

    const formattedMessages = [
      { role: 'user', content: [{ type: 'text', text: webPageContent }] },
      ...messages.map((message: ThreadMessage) => ({
        role: message.role || 'user',
        content:
          message.role === 'user'
            ? message.content
            : (message.content[0] as MessageContent).text,
      })),
    ];

    const result = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: formattedMessages,
        }),
        signal: abortSignal,
      },
    );

    const data = await result.json();
    return {
      content: [
        {
          type: 'text',
          text: data['choices'][data['choices'].length - 1]['message'][
            'content'
          ],
        },
      ],
    };
  },
};

function getDynamicWebPageContent() {
  const bodyText = document.body.innerText;

  return `
    Webpage visible text: ${bodyText.slice(0, 5000)}...
  `;
}

export default function LLMRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const runtime = useLocalRuntime(MyModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
