'use client';

import React, { useEffect, useState } from 'react';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    order: number;
}

const FAQAdminPage: React.FC = () => {
    const [items, setItems] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [form, setForm] = useState({
        id: null as number | null,
        question: '',
        answer: '',
        order: 0
    });

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/faqs');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (e) {
            setError('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/api/admin/faqs/${form.id}` : '/api/admin/faqs';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess('FAQ saved successfully');
                setForm({ id: null, question: '', answer: '', order: 0 });
                load();
            } else {
                const d = await res.json();
                setError(d.error || 'Failed to save FAQ');
            }
        } catch (e) {
            setError('Failed to save FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: FAQ) => {
        setForm({ id: item.id, question: item.question, answer: item.answer, order: item.order });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch (e) {
            setError('Failed to delete FAQ');
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {form.id ? 'Edit FAQ' : 'New FAQ'}
                    </h2>
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <input
                                type="text"
                                value={form.question}
                                onChange={e => setForm({ ...form, question: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#326101] text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                            <textarea
                                value={form.answer}
                                onChange={e => setForm({ ...form, answer: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#326101] text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#326101] text-gray-900"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#326101] text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-[#639427] disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save FAQ'}
                            </button>
                            {form.id && (
                                <button
                                    type="button"
                                    onClick={() => setForm({ id: null, question: '', answer: '', order: 0 })}
                                    className="px-6 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-y-auto max-h-[80vh]">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Published FAQs</h2>
                    {loading ? (
                        <p className="text-gray-500 italic">Loading...</p>
                    ) : items.length === 0 ? (
                        <p className="text-gray-500 italic">No FAQs created yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-[#639427] uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded">Order: {item.order}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-sm text-[#326101] font-bold hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-sm text-red-600 font-bold hover:underline">Delete</button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{item.question}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQAdminPage;
