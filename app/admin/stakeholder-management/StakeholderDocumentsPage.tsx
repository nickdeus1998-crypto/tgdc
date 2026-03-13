'use client';

import React, { useState, useEffect } from 'react';

const StakeholderDocumentsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [items, setItems] = useState<Array<{ id: number; name: string; email: string; company?: string | null; _count: { documents: number } }>>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [docs, setDocs] = useState<Array<{ id: number; filename: string; storagePath: string; sizeBytes: number; senderRole: string; uploadedAt: string }>>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchStakeholders = async () => {
        try {
            const res = await fetch('/api/admin/stakeholders');
            if (!res.ok) throw new Error('Failed to load stakeholders');
            const data = await res.json();
            setItems(data.items || []);
            if (!selectedId && data.items?.[0]) setSelectedId(data.items[0].id);
            setLoading(false);
        } catch (e: any) {
            setErr(e?.message || 'error');
            setLoading(false);
        }
    };

    const fetchDocs = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/stakeholders/${id}/documents?limit=50`);
            if (res.ok) {
                const data = await res.json();
                setDocs(data.items || []);
            }
        } catch { }
    };

    useEffect(() => {
        fetchStakeholders();
    }, []);

    useEffect(() => {
        if (selectedId) fetchDocs(selectedId);
    }, [selectedId]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>, isGlobal = false) => {
        e.preventDefault();
        if (!isGlobal && !selectedId) return;
        setUploading(true);
        setUploadStatus(null);
        const form = new FormData(e.currentTarget);
        try {
            const endpoint = isGlobal
                ? '/api/admin/stakeholders/post-document-all'
                : `/api/admin/stakeholders/${selectedId}/post-document`;

            const res = await fetch(endpoint, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();
            if (res.ok) {
                setUploadStatus({
                    type: 'success',
                    message: isGlobal
                        ? 'Document broadcasted to all stakeholders successfully.'
                        : 'Document posted to stakeholder successfully.'
                });
                e.currentTarget.reset();
                if (selectedId) fetchDocs(selectedId);
                fetchStakeholders(); // refresh counts
            } else {
                setUploadStatus({ type: 'error', message: data.error || 'Upload failed.' });
            }
        } catch {
            setUploadStatus({ type: 'error', message: 'Upload failed.' });
        } finally {
            setUploading(false);
        }
    };

    const selectedStakeholder = items.find(it => it.id === selectedId);

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Stakeholder List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Select Stakeholder</h2>
                            <p className="text-xs text-gray-500">Assign documents to a specific portal</p>
                        </div>
                        <div className="max-h-[600px] overflow-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading stakeholders...</div>
                            ) : items.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No stakeholders found.</div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {items.map(it => (
                                        <li key={it.id}>
                                            <button
                                                onClick={() => setSelectedId(it.id)}
                                                className={`w-full text-left p-4 hover:bg-green-50/50 transition-colors ${selectedId === it.id ? 'bg-green-50 border-r-4 border-[#326101]' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{it.name}</p>
                                                        <p className="text-xs text-gray-500">{it.company || 'Private Stakeholder'}</p>
                                                    </div>
                                                    <span className="bg-white border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                        {it._count.documents} Docs
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Document Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Global Upload Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#326101]/20 p-6 bg-gradient-to-br from-green-50/30 to-white">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-[#326101]/10 flex items-center justify-center text-[#326101]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Broadcast to All Stakeholders</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Upload a single document that will be instantly distributed to <strong>every</strong> stakeholder portal.
                            </p>

                            <form onSubmit={(e) => handleUpload(e, true)} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="file"
                                    name="file"
                                    required
                                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-[#326101] text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
                                >
                                    {uploading ? 'Broadcasting...' : 'Broadcast File'}
                                </button>
                            </form>
                        </div>

                        {!selectedId ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                                Select a stakeholder to manage their specific documents
                            </div>
                        ) : (
                            <>
                                {/* Upload Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Post for {selectedStakeholder?.name} Only</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload documents that will appear <strong>only</strong> in <strong>{selectedStakeholder?.name}'s</strong> portal.
                                    </p>

                                    {uploadStatus && (
                                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {uploadStatus.message}
                                        </div>
                                    )}

                                    <form onSubmit={(e) => handleUpload(e, false)} className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="file"
                                            name="file"
                                            required
                                            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#326101]/10 file:text-[#326101] hover:file:bg-[#326101]/20"
                                        />
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
                                        >
                                            {uploading ? 'Uploading...' : 'Post for Stakeholder'}
                                        </button>
                                    </form>
                                </div>

                                {/* Documents List */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-lg font-bold text-gray-900">Exchange History</h3>
                                    </div>
                                    <div className="max-h-[500px] overflow-auto">
                                        {docs.length === 0 ? (
                                            <div className="p-12 text-center text-gray-500 italic">
                                                No documents have been exchanged yet.
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3">Document</th>
                                                        <th className="px-6 py-3">Sender</th>
                                                        <th className="px-6 py-3">Size</th>
                                                        <th className="px-6 py-3">Date</th>
                                                        <th className="px-6 py-3 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {docs.map(d => (
                                                        <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded grid place-items-center text-white font-bold text-[10px] ${d.filename.toLowerCase().endsWith('.pdf') ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                                        {d.filename.split('.').pop()?.toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium text-gray-900 truncate max-w-[200px]" title={d.filename}>{d.filename}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.senderRole === 'admin' ? 'bg-[#326101]/10 text-[#326101]' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {d.senderRole === 'admin' ? 'TGDC' : 'Stakeholder'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                                {(d.sizeBytes / 1024).toFixed(1)} KB
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500">
                                                                {new Date(d.uploadedAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <a
                                                                    href={d.storagePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[#326101] font-bold hover:underline"
                                                                >
                                                                    Download
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StakeholderDocumentsPage;
