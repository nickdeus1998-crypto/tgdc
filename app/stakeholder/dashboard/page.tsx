'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StakeholderDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: number; name: string; email: string } | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [msgHistory, setMsgHistory] = useState<Array<{ id: number; subject: string; content: string; sentAt: string }>>([]);
  const [msgCursor, setMsgCursor] = useState<number | null>(null);
  const [docs, setDocs] = useState<Array<{ id: number; filename: string; storagePath: string; sizeBytes: number; uploadedAt: string }>>([]);
  const [docCursor, setDocCursor] = useState<number | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stakeholder/me').then(r => r.json()).then(d => {
      if (!d.user) router.replace('/stakeholder/login'); else setMe(d.user);
    })
  }, [router]);

  useEffect(() => {
    if (!me) return;
    const load = async () => {
      try {
        const [mRes, dRes] = await Promise.all([
          fetch('/api/stakeholder/messages?limit=10'),
          fetch('/api/stakeholder/documents?limit=10'),
        ]);
        if (mRes.ok) {
          const m = await mRes.json();
          setMsgHistory(m.items || []);
          setMsgCursor(m.nextCursor ?? null);
        }
        if (dRes.ok) {
          const d = await dRes.json();
          setDocs(d.items || []);
          setDocCursor(d.nextCursor ?? null);
        }
      } catch {
        // ignore
      }
    };
    load();
  }, [me]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const res = await fetch('/api/stakeholder/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, content }) })
    const data = await res.json();
    if (res.ok) {
      setStatus('Message sent. We will reach out shortly.');
      setSubject('');
      setContent('');
      // refresh history
      try {
        const mRes = await fetch('/api/stakeholder/messages?limit=10');
        if (mRes.ok) {
          const m = await mRes.json();
          setMsgHistory(m.items || []);
          setMsgCursor(m.nextCursor ?? null);
        }
      } catch {}
    }
    else setStatus(data.error || 'Failed to send.');
  }

  const uploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadStatus(null);
    setUploading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/stakeholder/document', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus('Document uploaded successfully.');
        e.currentTarget.reset();
        const dRes = await fetch('/api/stakeholder/documents?limit=10');
        if (dRes.ok) {
          const d = await dRes.json();
          setDocs(d.items || []);
          setDocCursor(d.nextCursor ?? null);
        }
      } else {
        setUploadStatus(data.error || 'Upload failed.');
      }
    } catch {
      setUploadStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const logout = async () => {
    await fetch('/api/stakeholder/logout', { method: 'POST' });
    router.replace('/stakeholder/login');
  }

  const loadMoreMessages = async () => {
    if (!msgCursor) return;
    const res = await fetch(`/api/stakeholder/messages?limit=10&cursor=${msgCursor}`);
    if (res.ok) {
      const data = await res.json();
      setMsgHistory(prev => [...prev, ...(data.items || [])]);
      setMsgCursor(data.nextCursor ?? null);
    }
  }

  const loadMoreDocs = async () => {
    if (!docCursor) return;
    const res = await fetch(`/api/stakeholder/documents?limit=10&cursor=${docCursor}`);
    if (res.ok) {
      const data = await res.json();
      setDocs(prev => [...prev, ...(data.items || [])]);
      setDocCursor(data.nextCursor ?? null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome{me ? `, ${me.name}` : ''}</h1>
            <p className="text-gray-600 text-sm">Use this portal to send messages or documents to TGDC staff.</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 underline">Sign out</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Send a message</h2>
            {status && (
              <p className={`text-sm mb-3 ${status.includes('sent') ? 'text-emerald-600' : 'text-red-600'}`}>{status}</p>
            )}
            <form onSubmit={sendMessage} className="space-y-3">
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message"
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              />
              <button className="bg-gradient-to-r from-[#326101] to-[#639427] text-white rounded-md px-4 py-2 font-semibold">Send</button>
            </form>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Previous messages</h3>
              {msgHistory.length === 0 ? (
                <p className="text-sm text-gray-600">No messages yet.</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-auto pr-1">
                  {msgHistory.map(m => (
                    <li key={m.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">{m.subject}</p>
                        <span className="text-xs text-gray-500">{new Date(m.sentAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{m.content}</p>
                    </li>
                  ))}
                </ul>
              )}
              {msgCursor && (
                <div className="mt-3">
                  <button onClick={loadMoreMessages} className="text-sm text-emerald-700 hover:underline">Load more</button>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Send documents</h2>
            {uploadStatus && (
              <p className={`text-sm mb-3 ${uploadStatus.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{uploadStatus}</p>
            )}
            <form onSubmit={uploadDocument} className="space-y-3">
              <input
                type="file"
                name="file"
                required
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <button disabled={uploading} className="bg-gradient-to-r from-[#326101] to-[#639427] disabled:opacity-50 text-white rounded-md px-4 py-2 font-semibold">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Your documents</h3>
              {docs.length === 0 ? (
                <p className="text-sm text-gray-600">No documents uploaded yet.</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-auto pr-1">
                  {docs.map(d => (
                    <li key={d.id} className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{d.filename}</p>
                        <p className="text-xs text-gray-500">{(d.sizeBytes / 1024).toFixed(1)} KB • {new Date(d.uploadedAt).toLocaleString()}</p>
                      </div>
                      <a href={d.storagePath} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 hover:underline">Download</a>
                    </li>
                  ))}
                </ul>
              )}
              {docCursor && (
                <div className="mt-3">
                  <button onClick={loadMoreDocs} className="text-sm text-emerald-700 hover:underline">Load more</button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
