'use client';

import React, { useEffect, useState } from 'react';
import { sanitizeHtml } from '@/app/lib/sanitize';

interface StaticPageViewProps {
    slug: string;
    fallbackTitle: string;
}

const StaticPageView: React.FC<StaticPageViewProps> = ({ slug, fallbackTitle }) => {
    const [title, setTitle] = useState(fallbackTitle);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState('');

    useEffect(() => {
        fetch(`/api/static-pages?slug=${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.title) setTitle(data.title);
                if (data.content) setContent(data.content);
                if (data.updatedAt) setUpdatedAt(new Date(data.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero banner */}
            <div className="relative hero-bg text-white overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-20 w-48 h-48 bg-white/50 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
                    {updatedAt && (
                        <p className="mt-3 text-sm text-white/60">Last updated: {updatedAt}</p>
                    )}
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="text-sm text-gray-500">
                    <a href="/" className="hover:text-[#326101] transition-colors">Home</a>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 font-medium">{title}</span>
                </nav>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 lg:p-16">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-[#326101] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : content ? (
                        <div
                            className="rich-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                        />
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg font-medium">This page has not been set up yet.</p>
                            <p className="text-gray-400 text-sm mt-2">Content can be added from Dashboard → Web Management → Static Pages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaticPageView;
