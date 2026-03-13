'use client';

import { useEffect, useRef, useState } from 'react';

type ChatMsg = { role: 'visitor' | 'admin'; content: string; time: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [firstMsg, setFirstMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check admin online status
  useEffect(() => {
    const check = () => fetch('/api/chat/status').then(r => r.json()).then(d => setOnline(d.online)).catch(() => { });
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, []);

  // Poll messages when in chat phase
  useEffect(() => {
    if (phase === 'chat' && sessionId) {
      const poll = () =>
        fetch(`/api/chat?sessionId=${sessionId}`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d.messages)) setMessages(d.messages); })
          .catch(() => { });
      poll();
      pollRef.current = setInterval(poll, 3000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, [phase, sessionId]);

  // Scroll to bottom
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const startChat = async () => {
    setFormError('');
    if (!email.trim() || !phone.trim() || !firstMsg.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), name: name.trim(), message: firstMsg.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSessionId(data.sessionId);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setPhase('chat');
    } catch (e: any) {
      setFormError(e?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || sending || !sessionId) return;
    setSending(true);
    setInput('');
    // Optimistic update
    setMessages(prev => [...prev, { role: 'visitor', content: text, time: new Date().toISOString() }]);
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
    } catch { }
    setSending(false);
  };

  const formatTime = (t: string) => {
    try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 shadow-2xl border border-gray-200 bg-white rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#326101] to-[#639427] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#326101] ${online ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold">Support Chat</div>
                <div className="text-[10px] text-white/80">{online ? 'We are online' : 'We are offline'}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
          </div>

          {/* Body */}
          {phase === 'form' ? (
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  {online
                    ? '👋 Hi there! Fill in your details and we\'ll be right with you.'
                    : '📫 We\'re currently offline. Leave your message and we\'ll respond via email.'}
                </p>
              </div>
              {formError && <p className="text-xs text-red-500 mb-3">{formError}</p>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-gray-300">(optional)</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#326101] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#326101] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 700 000 000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#326101] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Message <span className="text-red-400">*</span></label>
                  <textarea value={firstMsg} onChange={e => setFirstMsg(e.target.value)} rows={3} placeholder="How can we help you?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-[#326101] focus:border-transparent" required />
                </div>
                <button onClick={startChat} disabled={submitting} className="w-full py-2.5 bg-gradient-to-r from-[#326101] to-[#639427] text-white rounded-lg text-sm font-semibold hover:shadow-md disabled:opacity-50 transition-all">
                  {submitting ? 'Starting...' : online ? 'Start Chat' : 'Send Message'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50" style={{ minHeight: '200px', maxHeight: '320px' }}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'visitor' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'visitor'
                      ? 'bg-[#326101] text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                      }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.role === 'visitor' ? 'text-white/60' : 'text-gray-400'}`}>{formatTime(m.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Composer */}
              <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMsg(); } }}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                    disabled={sending}
                  />
                  <button onClick={sendMsg} disabled={sending || !input.trim()} className="p-2 bg-[#326101] disabled:opacity-40 text-white rounded-lg hover:bg-[#639427] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-[#326101] to-[#639427] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all group"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {online && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />}
          </>
        )}
      </button>
    </div>
  );
}
