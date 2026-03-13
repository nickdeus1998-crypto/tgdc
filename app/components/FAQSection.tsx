'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const FAQSection: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

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

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#326101]"></div>
            </div>
        );
    }

    if (faqs.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Find answers to common questions about geothermal energy development and TGDC's projects in Tanzania.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.slice(0, 5).map((faq, index) => (
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
                                <span className={`text-lg font-medium transition-colors ${activeIndex === index ? 'text-[#326101]' : 'text-gray-900 group-hover:text-[#326101]'
                                    }`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeIndex === index
                                    ? 'bg-[#326101] border-[#326101] text-white rotate-180'
                                    : 'border-gray-200 text-gray-400 group-hover:border-[#326101] group-hover:text-[#326101]'
                                    }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed text-lg border-t border-green-50/50">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/faqs"
                        className="inline-flex items-center text-[#326101] font-semibold hover:text-[#639427] transition-all duration-300 hover:translate-x-2 group"
                    >
                        View More Frequently Asked Questions
                        <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
