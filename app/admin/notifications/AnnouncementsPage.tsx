'use client';

import React, { useEffect, useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    scheduledDate: string | null;
    isActive: boolean;
    isPublic: boolean;
    createdAt: string;
}

const announcementTypes = ['Meeting', 'Office Update', 'Event', 'Urgent', 'Holiday', 'Policy'];
const priorities = ['Low', 'Normal', 'High'];

const AnnouncementsPage: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(isAdmin === true);

    const [form, setForm] = useState({
        id: null as number | null,
        title: '',
        content: '',
        type: 'Office Update',
        priority: 'Normal',
        scheduledDate: '',
        isPublic: false,
    });

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/announcements');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.items || []);
                if (isAdmin === undefined) {
                    setCanManage(data.canManage === true);
                }
            }
        } catch (e) {
            setError('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/api/admin/announcements/${form.id}` : '/api/admin/announcements';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess('Announcement published successfully');
                setForm({
                    id: null, title: '', content: '', type: 'Office Update', priority: 'Normal', scheduledDate: '', isPublic: false
                });
                load();
            } else {
                const d = await res.json();
                setError(d.error || 'Failed to save announcement');
            }
        } catch (e) {
            setError('Failed to save announcement');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ann: Announcement) => {
        setForm({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            type: ann.type,
            priority: ann.priority,
            scheduledDate: ann.scheduledDate ? ann.scheduledDate.substring(0, 16) : '',
            isPublic: ann.isPublic || false,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch (e) {
            setError('Failed to delete announcement');
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'Urgent': return 'bg-red-50 text-red-600 border-red-200';
            case 'Meeting': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Event': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Holiday': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Policy': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getPriorityDot = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-500';
            case 'Normal': return 'bg-emerald-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Management Form */}
                {canManage && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {form.id
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    }
                                </svg>
                                {form.id ? 'Edit Announcement' : 'New Announcement'}
                            </h2>

                            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
                            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-200">{success}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        placeholder="Announcement title"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        >
                                            {announcementTypes.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            value={form.priority}
                                            onChange={e => setForm({ ...form, priority: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                        >
                                            {priorities.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={form.scheduledDate}
                                        onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition outline-none resize-none text-gray-900"
                                        placeholder="Announcement details..."
                                        required
                                    />
                                </div>

                                {/* Public toggle */}
                                <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublic}
                                        onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                                        className="w-4 h-4 accent-[#326101]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-800">Publish to public website</span>
                                        <p className="text-xs text-gray-500 mt-0.5">When checked, this announcement appears on the public Information Center page.</p>
                                    </div>
                                </label>
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Publishing...' : (form.id ? 'Update' : 'Publish')}
                                    </button>
                                    {/* Cancel on edit */}
                                    {form.id && (
                                        <button
                                            type="button"
                                            onClick={() => setForm({
                                                id: null, title: '', content: '', type: 'Office Update', priority: 'Normal', scheduledDate: '', isPublic: false
                                            })}
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

                {/* Announcements List */}
                <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                            <div className="w-10 h-10 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                            <p className="text-gray-400 mt-4 text-sm">Loading announcements...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900">No announcements yet</h3>
                            <p className="text-gray-400 max-w-xs mx-auto mt-1 text-sm">No announcements have been posted.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((ann) => (
                                <div
                                    key={ann.id}
                                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                >
                                    {/* Header */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeBadge(ann.type)}`}>
                                            {ann.type}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${ann.isPublic ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {ann.isPublic ? '🌐 Public' : '🔒 Internal'}
                                        </span>
                                        {ann.priority === 'High' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium border border-red-200">
                                                High Priority
                                            </span>
                                        )}
                                        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(ann.priority)}`}></span>
                                            {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                                        {ann.title}
                                    </h3>

                                    {/* Content */}
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {ann.content}
                                    </p>

                                    {/* Scheduled Date */}
                                    {ann.scheduledDate && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Scheduled: {new Date(ann.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {canManage && (
                                        <div className="flex justify-end gap-4 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(ann)}
                                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ann.id)}
                                                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementsPage;
