'use client';

import { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content:
        'Hi! I’m your assistant. Ask me anything about our services.',
    },
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: data.reply || 'Okay.',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          content: 'Sorry, I had trouble replying. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {open && (
        <div className='mb-3 w-80 sm:w-96 shadow-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 rounded-xl overflow-hidden'>
          <div className='px-4 py-3 bg-blue-600 text-white flex items-center justify-between'>
            <span className='font-semibold'>Live Chat</span>
            <button
              aria-label='Close chat'
              className='text-white/90 hover:text-white'
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div
            ref={listRef}
            className='max-h-80 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-950'
          >
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block px-3 py-2 rounded-lg text-sm ' +
                    (m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className='p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={sending ? 'Sending…' : 'Type your message'}
                className='flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className='px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Hide chat' : 'Open chat'}
        className='h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      >
        {open ? '-' : '💬'}
      </button>
    </div>
  );
}

