'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MediaPicker from '../components/MediaPicker';

const StableQuillEditor = dynamic(() => import('../components/StableQuillEditor'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface NewsItem {
    id: number;
    title: string;
    category: string;
    date: string;
    content: string;
    coverImage?: string | null;
    expiresAt?: string | null;
}

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean'],
    ],
    clipboard: { matchVisual: false },
};

const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
];

const emptyForm: Partial<NewsItem> = {
    title: '',
    category: 'Announcement',
    date: new Date().toISOString().slice(0, 10),
    content: '',
    coverImage: '',
    expiresAt: ''
};

const NewsManagementPage: React.FC = () => {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<NewsItem>>({ ...emptyForm });

    const onContentChange = useCallback((val: string) => {
        setForm((prev) => ({ ...prev, content: val }));
    }, []);

    // Section titles
    const [newsTitle, setNewsTitle] = useState('News');
    const [newsSubtitle, setNewsSubtitle] = useState('Stay informed with the latest developments in geothermal energy, project updates, and industry innovations from our expert team.');
    const [savingTitles, setSavingTitles] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/news');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch {
            setError('Failed to load news articles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        fetch('/api/site-settings?key=news_section_title')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.value) setNewsTitle(data.value); })
            .catch(() => { });
        fetch('/api/site-settings?key=news_section_subtitle')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.value) setNewsSubtitle(data.value); })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/api/admin/news/${form.id}` : '/api/admin/news';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess(form.id ? 'Article updated successfully' : 'Article published successfully');
                setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
                load();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const d = await res.json();
                setError(d.error || 'Failed to save article');
            }
        } catch {
            setError('Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: NewsItem) => {
        setForm({
            id: item.id,
            title: item.title || '',
            category: item.category || 'Announcement',
            date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
            content: item.content || '',
            coverImage: item.coverImage || '',
            expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : ''
        });
        setError(null);
        setSuccess(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch {
            setError('Failed to delete article');
        }
    };

    const cancelEdit = () => {
        setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
        setError(null);
        setSuccess(null);
    };

    const catBadge = (cat: string) => {
        switch (cat) {
            case 'Alert': return 'bg-red-50 text-red-700 border-red-100';
            case 'News': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Update': return 'bg-purple-50 text-purple-700 border-purple-100';
            default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm">{success}</span>
                    </div>
                )}

                {/* Section Titles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Section Title & Subtitle</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Heading shown above the news cards on the homepage.</p>
                        </div>
                        <button
                            type="button"
                            disabled={savingTitles}
                            onClick={async () => {
                                setSavingTitles(true);
                                try {
                                    await Promise.all([
                                        fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'news_section_title', value: newsTitle }) }),
                                        fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'news_section_subtitle', value: newsSubtitle }) }),
                                    ]);
                                    alert('Section title saved!');
                                } catch { alert('Failed to save'); }
                                finally { setSavingTitles(false); }
                            }}
                            className="px-4 py-1.5 bg-[#326101] text-white rounded-lg text-xs font-medium hover:bg-[#2a5101] disabled:bg-gray-400"
                        >
                            {savingTitles ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Title</label>
                            <input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="News" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                            <input type="text" value={newsSubtitle} onChange={(e) => setNewsSubtitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" placeholder="Stay informed with..." />
                        </div>
                    </div>
                </div>

                {/* Editor Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {form.id ? 'Edit Article' : 'New Article'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">Create or edit news articles and announcements for the public website.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Enter article title..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                                required
                            />
                        </div>

                        {/* Category, Date, Expiration — row */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                                >
                                    <option value="Announcement">Announcement</option>
                                    <option value="Alert">Alert</option>
                                    <option value="News">News</option>
                                    <option value="Update">Update</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Publish Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Expires At
                                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="datetime-local"
                                        value={form.expiresAt || ''}
                                        onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                                    />
                                    {form.expiresAt && (
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, expiresAt: '' })}
                                            className="px-3 py-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
                                            title="Clear expiration"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <MediaPicker
                            label="Cover Image"
                            value={form.coverImage || ''}
                            onChange={(url) => setForm({ ...form, coverImage: url })}
                        />

                        {/* Rich Content Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Content</label>
                            <div className="border border-gray-200 rounded-lg overflow-visible bg-white relative">
                                <StableQuillEditor
                                    value={form.content || ''}
                                    onChange={onContentChange}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write your article content here..."
                                    style={{ minHeight: 280 }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#326101] to-[#639427] hover:shadow-md disabled:opacity-50 transition-all"
                            >
                                {saving ? 'Saving...' : form.id ? 'Update Article' : 'Publish Article'}
                            </button>
                            {form.id && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Articles List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Published Articles</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{items.length} article{items.length !== 1 ? 's' : ''} total</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-gray-400">
                                <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Loading articles...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                <p className="text-gray-400 text-sm">No articles yet. Create your first one above.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map(item => {
                                    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50/50 ${isExpired ? 'border-red-100 bg-red-50/20' : 'border-gray-100'}`}
                                        >
                                            {/* Cover thumbnail */}
                                            {item.coverImage ? (
                                                <img src={item.coverImage} className="w-16 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0" alt="" />
                                            ) : (
                                                <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${catBadge(item.category)}`}>
                                                        {item.category}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">Expired</span>
                                                    )}
                                                    <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                                                {item.expiresAt && (
                                                    <p className={`text-[11px] mt-0.5 ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
                                                        Expires: {new Date(item.expiresAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-gray-400 hover:text-[#326101] hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsManagementPage;
