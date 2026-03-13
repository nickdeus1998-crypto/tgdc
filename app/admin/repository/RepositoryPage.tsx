'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface RepositoryItem {
    id: number;
    title: string;
    category: string;
    url: string;
    description: string | null;
    fileType: string | null;
    fileSize: string | null;
    uploadedBy: string | null;
    createdAt: string;
}

const categories = [
    'General',
    'Financial',
    'Technical',
    'Guidelines',
    'Human Resources',
    'Legal',
    'Strategic Plans',
    'Field Reports'
];

const RepositoryPage: React.FC = () => {
    const [items, setItems] = useState<RepositoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const [form, setForm] = useState({
        id: null as number | null,
        title: '',
        category: 'General',
        url: '',
        description: '',
        fileType: 'pdf',
        fileSize: ''
    });

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/repository/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setForm(prev => ({
                    ...prev,
                    title: prev.title || data.filename.split('_').slice(1).join('_') || data.filename,
                    url: data.url,
                    fileType: data.fileType,
                    fileSize: data.readableSize
                }));
                setSuccess('File uploaded. Complete the details and save.');
            } else {
                const d = await res.json();
                setError(d.error || 'Upload failed');
            }
        } catch (e) {
            setError('Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/repository');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setCanManage(data.canManage === true);
            }
        } catch (e) {
            setError('Failed to load repository items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/api/admin/repository/${form.id}` : '/api/admin/repository';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess('Saved successfully');
                setForm({ id: null, title: '', category: 'General', url: '', description: '', fileType: 'pdf', fileSize: '' });
                load();
            } else {
                const d = await res.json();
                setError(d.error || 'Failed to save document');
            }
        } catch (e) {
            setError('Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: RepositoryItem) => {
        setForm({
            id: item.id,
            title: item.title,
            category: item.category,
            url: item.url,
            description: item.description || '',
            fileType: item.fileType || 'pdf',
            fileSize: item.fileSize || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const res = await fetch(`/api/admin/repository/${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch (e) {
            setError('Failed to delete document');
        }
    };

    const getFileIcon = (type: string | null) => {
        const t = (type || '').toLowerCase();
        if (t === 'pdf') return (
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 14a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" /></svg>
        );
        if (t === 'doc' || t === 'docx') return (
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v1H8v-1zm0 3h6v1H8v-1z" /></svg>
        );
        if (t === 'xls' || t === 'xlsx') return (
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h2v2H9v-2zm4 0h2v2h-2v-2zm-4 3h2v2H9v-2zm4 3h-2v-2h2v2z" /></svg>
        );
        return (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        );
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'Financial': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Technical': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Guidelines': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Human Resources': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Legal': return 'bg-red-50 text-red-600 border-red-200';
            case 'Strategic Plans': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'Field Reports': return 'bg-orange-50 text-orange-600 border-orange-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const allCategories = [...new Set(items.map(i => i.category))];
    const filteredItems = activeCategory ? items.filter(i => i.category === activeCategory) : items;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upload / Edit Form */}
                {canManage && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {form.id
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    }
                                </svg>
                                {form.id ? 'Edit Document' : 'Upload Document'}
                            </h2>

                            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
                            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-200">{success}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* File Upload */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {uploading ? 'Uploading...' : 'Quick Upload'}
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#326101] file:text-white hover:file:bg-[#639427] cursor-pointer"
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        Upload a file to auto-fill title, type, and size.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-3 text-xs text-gray-400">or manual entry</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        placeholder="e.g. Annual Report 2024"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                                        <select
                                            value={form.fileType}
                                            onChange={e => setForm({ ...form, fileType: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        >
                                            <option value="pdf">PDF</option>
                                            <option value="docx">Word (DOCX)</option>
                                            <option value="xlsx">Excel (XLSX)</option>
                                            <option value="pptx">PowerPoint</option>
                                            <option value="zip">ZIP Archive</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document URL / Path</label>
                                    <input
                                        type="text"
                                        value={form.url}
                                        onChange={e => setForm({ ...form, url: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        placeholder="Paste link or file path"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File Size (Optional)</label>
                                    <input
                                        type="text"
                                        value={form.fileSize}
                                        onChange={e => setForm({ ...form, fileSize: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        placeholder="e.g. 1.5 MB"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none resize-none text-gray-900"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : (form.id ? 'Update' : 'Add Document')}
                                    </button>
                                    {form.id && (
                                        <button
                                            type="button"
                                            onClick={() => setForm({ id: null, title: '', category: 'General', url: '', description: '', fileType: 'pdf', fileSize: '' })}
                                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Documents List */}
                <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Header & Category Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {filteredItems.length} file{filteredItems.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Category Pills */}
                        {allCategories.length > 1 && (
                            <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!activeCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All
                                </button>
                                {allCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <div className="w-10 h-10 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm">Loading repository...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <h3 className="text-base font-semibold text-gray-900">No documents found</h3>
                                <p className="text-gray-400 text-sm mt-1">{activeCategory ? `No documents in "${activeCategory}" category.` : 'No documents have been uploaded yet.'}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-3 px-3 rounded-lg transition-colors">
                                        {/* File Icon */}
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {getFileIcon(item.fileType)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryBadge(item.category)}`}>
                                                    {item.category}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    {item.uploadedBy || 'Admin'}
                                                </span>
                                                {item.fileSize && (
                                                    <span>{item.fileSize}</span>
                                                )}
                                                <span className="uppercase text-gray-500">
                                                    {item.fileType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#326101] text-white text-xs font-medium rounded-lg hover:bg-[#639427] transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </a>
                                            {canManage && (
                                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(item)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepositoryPage;
