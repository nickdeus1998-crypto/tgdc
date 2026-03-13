'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: string;
    title: string;
    snippet: string;
    url: string;
    category?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const typeIcons: Record<string, string> = {
    'News': 'fas fa-newspaper',
    'Geothermal Site': 'fas fa-map-marker-alt',
    'Project': 'fas fa-project-diagram',
    'Tender': 'fas fa-file-contract',
    'Service': 'fas fa-cogs',
    'FAQ': 'fas fa-question-circle',
    'Sustainability': 'fas fa-leaf',
    'Partner': 'fas fa-handshake',
    'Info Center': 'fas fa-photo-video',
    'Employee': 'fas fa-user-tie',
    'About Us': 'fas fa-building',
    'Impact': 'fas fa-bolt',
    'Leadership': 'fas fa-users',
    'Announcement': 'fas fa-bullhorn',
    'Document': 'fas fa-file-alt',
};

const typeColors: Record<string, string> = {
    'News': 'bg-blue-50 text-blue-700 border-blue-200',
    'Geothermal Site': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Project': 'bg-amber-50 text-amber-700 border-amber-200',
    'Tender': 'bg-purple-50 text-purple-700 border-purple-200',
    'Service': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'FAQ': 'bg-orange-50 text-orange-700 border-orange-200',
    'Sustainability': 'bg-green-50 text-green-700 border-green-200',
    'Partner': 'bg-teal-50 text-teal-700 border-teal-200',
    'Info Center': 'bg-pink-50 text-pink-700 border-pink-200',
    'Employee': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'About Us': 'bg-slate-50 text-slate-700 border-slate-200',
    'Impact': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Leadership': 'bg-violet-50 text-violet-700 border-violet-200',
    'Announcement': 'bg-red-50 text-red-700 border-red-200',
    'Document': 'bg-gray-50 text-gray-700 border-gray-200',
};

function highlightMatch(text: string, query: string) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="search-highlight bg-transparent text-[#326101] font-semibold">{part}</mark>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            // Reset state when opening
            setQuery('');
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
                setHasSearched(true);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    const handleResultClick = (url: string) => {
        onClose();
        router.push(url);
    };

    // Group results by type
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    const totalResults = results.length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm search-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200/50 search-modal overflow-hidden max-h-[75vh] flex flex-col">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <svg className="w-5 h-5 text-[#326101] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Search across the entire site…"
                        className="flex-1 text-lg text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-md px-2 py-1">
                        <span>ESC</span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="overflow-y-auto flex-1 overscroll-contain">
                    {/* Idle state */}
                    {!hasSearched && !isLoading && query.length < 2 && (
                        <div className="px-5 py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#326101]/10 to-[#639427]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#326101]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">Search for news, projects, tenders, services, and more…</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {['Geothermal', 'Tenders', 'Projects', 'News', 'Vision', 'About'].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => { setQuery(tag); performSearch(tag); }}
                                        className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#326101]/10 hover:text-[#326101] transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="px-5 py-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-3 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 shimmer flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 shimmer rounded w-3/4" />
                                        <div className="h-3 bg-gray-50 shimmer rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {hasSearched && !isLoading && totalResults === 0 && (
                        <div className="px-5 py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No results found for &ldquo;{query}&rdquo;</p>
                            <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling</p>
                        </div>
                    )}

                    {/* Results grouped by type */}
                    {!isLoading && totalResults > 0 && (
                        <div className="py-2">
                            {/* Result count */}
                            <div className="px-5 py-2">
                                <p className="text-xs text-gray-400 font-medium">
                                    {totalResults} result{totalResults !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            {Object.entries(grouped).map(([type, items]) => (
                                <div key={type}>
                                    {/* Type header */}
                                    <div className="px-5 py-2 flex items-center gap-2">
                                        <i className={`${typeIcons[type] || 'fas fa-circle'} text-xs text-gray-400`} />
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{type}</span>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium">
                                            {items.length}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    {items.map((result, idx) => (
                                        <button
                                            key={`${type}-${idx}`}
                                            onClick={() => handleResultClick(result.url)}
                                            className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${typeColors[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                <i className={`${typeIcons[type] || 'fas fa-circle'} text-xs`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#326101] transition-colors">
                                                        {highlightMatch(result.title, query)}
                                                    </h4>
                                                    {result.category && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${typeColors[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                            {result.category}
                                                        </span>
                                                    )}
                                                </div>
                                                {result.snippet && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                        {highlightMatch(result.snippet, query)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <svg className="w-4 h-4 text-gray-300 group-hover:text-[#326101] flex-shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">↑↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">↵</kbd>
                            select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">esc</kbd>
                        close
                    </span>
                </div>
            </div>
        </div>
    );
}
