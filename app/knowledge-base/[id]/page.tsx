'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { sanitizeHtml } from '@/app/lib/sanitize';

interface KBPost {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    content: string;
    thumbnail: string;
    createdAt: string;
}

export default function KnowledgeBasePostPage() {
    const params = useParams();
    const id = params?.id;
    const [post, setPost] = useState<KBPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`/api/information/${id}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setPost({
                    id: data.id,
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    description: data.description || '',
                    content: data.content || '',
                    thumbnail: data.thumbnail || '',
                    createdAt: data.createdAt || data.date || '',
                });
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#326101] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Article Not Found</h1>
                <p className="text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
                <Link
                    href="/information-center"
                    className="px-6 py-2.5 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] font-medium"
                >
                    ← Back to Information Center
                </Link>
            </div>
        );
    }

    const formattedDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero / Featured Image */}
            {post.thumbnail && (
                <div className="relative w-full h-[320px] md:h-[420px] bg-gradient-to-br from-[#326101] to-[#639427] overflow-hidden">
                    <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            {/* Content Container */}
            <article className="max-w-3xl mx-auto px-6 py-12 -mt-16 relative z-10">
                {/* Card wrap */}
                <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${post.thumbnail ? '' : 'mt-24'}`}>
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                        <Link
                            href="/information-center"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#326101] hover:underline mb-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Knowledge Base
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        {post.subtitle && (
                            <p className="text-base font-semibold text-[#639427] mt-2 uppercase tracking-wide">
                                {post.subtitle}
                            </p>
                        )}
                        {formattedDate && (
                            <p className="text-sm text-gray-400 mt-3">
                                {formattedDate}
                            </p>
                        )}
                    </div>

                    {/* Rich Content Body */}
                    <div className="px-8 py-8">
                        <div
                            className="rich-content prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                        />
                    </div>
                </div>
            </article>
        </main>
    );
}
