'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const StableQuillEditor = dynamic(() => import('../components/StableQuillEditor'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const PAGE_SLUGS = [
    { slug: 'sitemap', label: 'Sitemap' },
    { slug: 'privacy-policy', label: 'Privacy Policy' },
    { slug: 'terms-and-conditions', label: 'Terms and Conditions' },
    { slug: 'copyright-statement', label: 'Copyright Statement' },
];

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
        [{ script: 'sub' }, { script: 'super' }],
        [{ direction: 'rtl' }],
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
    'script', 'direction',
];

const StaticPagesEditorPage: React.FC = () => {
    const [activeSlug, setActiveSlug] = useState(PAGE_SLUGS[0].slug);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setMessage('');
            try {
                const res = await fetch(`/api/static-pages?slug=${activeSlug}`);
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setTitle(data.title || PAGE_SLUGS.find(p => p.slug === activeSlug)?.label || '');
                setContent(data.content || '');
            } catch {
                setMessage('Failed to load page content.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activeSlug]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/static-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: activeSlug, title, content }),
            });
            if (!res.ok) throw new Error('Save failed');
            setMessage('Page saved successfully!');
        } catch {
            setMessage('Save failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Static Pages Editor</h2>

                    {/* Tab buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {PAGE_SLUGS.map(p => (
                            <button
                                key={p.slug}
                                onClick={() => setActiveSlug(p.slug)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSlug === p.slug
                                        ? 'bg-[#326101] text-white border-[#326101]'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#326101] hover:text-[#326101]'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <div className="border border-gray-200 rounded-lg overflow-visible bg-white relative">
                                    <StableQuillEditor
                                        value={content}
                                        onChange={setContent}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        style={{ minHeight: 400 }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4">
                                {message && (
                                    <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                        {message}
                                    </p>
                                )}
                                <div className="ml-auto">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400 font-medium"
                                    >
                                        {saving ? 'Saving...' : 'Save Page'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                    <div className="border border-gray-100 rounded-lg p-8 bg-gray-50/50">
                        <div className="rich-content" dangerouslySetInnerHTML={{ __html: content || '<p style="color:#9ca3af;font-style:italic">No content yet. Start typing above.</p>' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticPagesEditorPage;
