'use client';

import React, { useEffect, useState, useRef } from 'react';

type ChatMsg = { role: 'visitor' | 'admin'; content: string; time: string };
type Session = { id: number; email: string; phone: string; name: string | null; lastMessage: string; lastRole: string; messageCount: number; closedAt: string | null; createdAt: string; updatedAt: string };

export default function SupportChatPage({ isAdmin }: { isAdmin: boolean }) {
    const [online, setOnline] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSession, setActiveSession] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load status + sessions
    useEffect(() => {
        fetch('/api/chat/status').then(r => r.json()).then(d => setOnline(d.online)).catch(() => { });
        loadSessions();
        const iv = setInterval(loadSessions, 5000);
        return () => clearInterval(iv);
    }, []);

    // Poll active session messages
    useEffect(() => {
        if (activeSession) {
            const poll = () =>
                fetch(`/api/chat?sessionId=${activeSession}`)
                    .then(r => r.json())
                    .then(d => { if (Array.isArray(d.messages)) setMessages(d.messages); })
                    .catch(() => { });
            poll();
            pollRef.current = setInterval(poll, 3000);
            return () => { if (pollRef.current) clearInterval(pollRef.current); };
        }
    }, [activeSession]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const loadSessions = async () => {
        try {
            const res = await fetch('/api/chat/sessions');
            const data = await res.json();
            if (Array.isArray(data.items)) setSessions(data.items);
        } catch { }
    };

    const toggleOnline = async () => {
        setToggling(true);
        try {
            const res = await fetch('/api/chat/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ online: !online }),
            });
            const data = await res.json();
            setOnline(data.online);
        } catch { }
        setToggling(false);
    };

    const sendReply = async () => {
        if (!reply.trim() || !activeSession || sending) return;
        setSending(true);
        const text = reply.trim();
        setReply('');
        setMessages(prev => [...prev, { role: 'admin', content: text, time: new Date().toISOString() }]);
        try {
            await fetch('/api/chat/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: activeSession, message: text }),
            });
        } catch { }
        setSending(false);
    };

    const formatTime = (t: string) => {
        try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
    };

    const formatDate = (t: string) => {
        try {
            const d = new Date(t);
            const now = new Date();
            if (d.toDateString() === now.toDateString()) return formatTime(t);
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + formatTime(t);
        } catch { return ''; }
    };

    const activeData = sessions.find(s => s.id === activeSession);

    if (!isAdmin) return <div className="p-8 text-center text-gray-500">You don't have access to this page.</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Support Chat</h2>
                    <p className="text-sm text-gray-500">Manage live chat with website visitors</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${online ? 'text-green-600' : 'text-gray-500'}`}>
                        {online ? '● Online' : '○ Offline'}
                    </span>
                    <button
                        onClick={toggleOnline}
                        disabled={toggling}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${online ? 'bg-[#326101]' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${online ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>
                <div className="flex h-full">
                    {/* Sessions sidebar */}
                    <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col h-full">
                        <div className="px-5 py-3.5 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Chat Sessions</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {sessions.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">No chats yet</div>
                            ) : (
                                sessions.map(s => {
                                    const isActive = s.id === activeSession;
                                    return (
                                        <div
                                            key={s.id}
                                            className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer border-l-2 transition-colors ${isActive ? 'bg-emerald-50/60 border-l-[#326101]' : 'border-l-transparent hover:bg-gray-50'
                                                }`}
                                            onClick={() => setActiveSession(s.id)}
                                        >
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {(s.name || s.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm truncate ${isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{s.name || s.email}</span>
                                                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatDate(s.updatedAt)}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{s.lastMessage || 'No messages'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400">📧 {s.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="flex-1 flex flex-col h-full">
                        {activeSession && activeData ? (
                            <>
                                {/* Chat header */}
                                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{activeData.name || activeData.email}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-3">
                                            <span>📧 {activeData.email}</span>
                                            <span>📱 {activeData.phone}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{activeData.messageCount} messages</span>
                                </div>
                                {/* Messages */}
                                <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-3.5 py-2 rounded-xl text-sm ${m.role === 'admin'
                                                ? 'bg-[#326101] text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{m.content}</p>
                                                <p className={`text-[10px] mt-1 ${m.role === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {m.role === 'admin' ? 'You' : (activeData.name || 'Visitor')} · {formatTime(m.time)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Composer */}
                                <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
                                    <div className="flex items-end gap-2">
                                        <textarea
                                            rows={1}
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#326101] focus:border-transparent text-sm text-gray-900"
                                        />
                                        <button
                                            onClick={sendReply}
                                            disabled={sending || !reply.trim()}
                                            className="p-2 bg-[#326101] disabled:opacity-40 text-white rounded-lg hover:bg-[#639427] transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-sm">Select a chat session to reply</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
