'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StakeholderDocuments() {
    const router = useRouter();
    const [me, setMe] = useState<{ id: number; name: string; email: string } | null>(null);
    const [docs, setDocs] = useState<Array<{ id: number; filename: string; storagePath: string; sizeBytes: number; senderRole: string; uploadedAt: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stakeholder/me').then(r => r.json()).then(d => {
            if (!d.user) router.replace('/stakeholder/login'); else setMe(d.user);
        })
    }, [router]);

    const loadDocs = async () => {
        if (!me) return;
        try {
            const res = await fetch('/api/stakeholder/documents?limit=100');
            if (res.ok) {
                const data = await res.json();
                setDocs(data.items || []);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (me) loadDocs();
    }, [me]);

    const adminDocs = docs.filter(d => d.senderRole === 'admin');
    const userDocs = docs.filter(d => d.senderRole === 'stakeholder');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/stakeholder/dashboard" className="text-emerald-700 hover:text-emerald-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Documents Portal</h1>
                        </div>
                        <p className="text-gray-600 text-sm">Access official documents from TGDC and view your uploaded files.</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Admin Documents */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 text-emerald-800">Official from TGDC</h2>
                        </div>

                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>)}
                            </div>
                        ) : adminDocs.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-500 italic">
                                No official documents have been shared with you yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {adminDocs.map(d => (
                                    <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                        <div className="flex items-start gap-3 relative">
                                            <div className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-sm ${d.filename.toLowerCase().endsWith('.pdf') ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                <span className="text-[10px] opacity-75">{d.filename.split('.').pop()?.toUpperCase()}</span>
                                                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate pr-4" title={d.filename}>{d.filename}</p>
                                                <p className="text-[11px] text-gray-500 mt-1">{(d.sizeBytes / 1024).toFixed(1)} KB · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                                                <a
                                                    href={d.storagePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100"
                                                >
                                                    Download Document
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* User Documents */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 text-blue-800">Your Uploads</h2>
                        </div>

                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>)}
                            </div>
                        ) : userDocs.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-500 italic">
                                You haven't uploaded any documents yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {userDocs.map(d => (
                                    <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group relative overflow-hidden">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-sm ${d.filename.toLowerCase().endsWith('.pdf') ? 'bg-red-400' : 'bg-blue-500'}`}>
                                                <span className="text-[10px] opacity-75">{d.filename.split('.').pop()?.toUpperCase()}</span>
                                                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate" title={d.filename}>{d.filename}</p>
                                                <p className="text-[11px] text-gray-500 mt-1">{(d.sizeBytes / 1024).toFixed(1)} KB · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                                                <a
                                                    href={d.storagePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-3 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100"
                                                >
                                                    View Upload
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
