'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const ITEMS_PER_PAGE = 10;

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch('/api/faqs');
                if (res.ok) {
                    const data = await res.json();
                    setFaqs(data);
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [faqs, searchQuery]);

    const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE);
    const paginatedFaqs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFaqs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredFaqs, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-32 pb-24">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Frequently Asked
                        <span className="block bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Everything you need to know about geothermal energy development, project status, and its impact on Tanzania.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search questions or keywords..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#326101] focus:border-transparent transition-all outline-none text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#326101]"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {paginatedFaqs.length > 0 ? (
                            paginatedFaqs.map((faq, index) => (
                                <div
                                    key={faq.id}
                                    className={`group border rounded-2xl transition-all duration-300 ${activeIndex === index
                                        ? 'border-[#326101] ring-1 ring-[#326101] shadow-lg bg-[#f0fdf4]'
                                        : 'border-gray-100 hover:border-green-200 bg-white'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                    >
                                        <span className={`text-xl font-bold transition-colors ${activeIndex === index ? 'text-[#326101]' : 'text-gray-900 group-hover:text-[#326101]'
                                            }`}>
                                            {faq.question}
                                        </span>
                                        <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeIndex === index
                                            ? 'bg-[#326101] border-[#326101] text-white rotate-180'
                                            : 'border-gray-200 text-gray-400 group-hover:border-[#326101] group-hover:text-[#326101]'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === index ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="p-8 pt-0 text-gray-600 leading-relaxed text-lg border-t border-green-50/50">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xl text-gray-500 font-medium">No questions found matching "{searchQuery}"</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-[#326101] font-bold hover:underline"
                                >
                                    Clear search and see all questions
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-3 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-12 h-12 rounded-xl border font-bold transition-all ${currentPage === i + 1
                                    ? 'bg-[#326101] border-[#326101] text-white shadow-lg'
                                    : 'border-gray-200 text-gray-600 hover:bg-white'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Home Link */}
                <div className="mt-20 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-400 hover:text-[#326101] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home Page
                    </Link>
                </div>
            </div>
        </main>
    );
}
