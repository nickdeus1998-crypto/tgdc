'use client'
import React, { useState } from 'react';
import Link from 'next/link';

export interface Tender {
  id: number;
  ref: string;
  title: string;
  category: string;
  status: string;
  deadline: string;
  publish: string;
  scope: string;
  docs: string;
  award?: { winner: string; date: string; amount: string };
}

interface ProcurementPlanItem {
  ref: string;
  title: string;
  category: string;
  quarter: string;
  notes: string;
}

const tenders: Tender[]  = [
  {
    id: 1,
    ref: 'TGDC/2024/G/001',
    title: 'Delivery and Delivery of Geological Sampling Equipment',
    category: 'goods',
    status: 'open',
    deadline: '2025-10-20',
    publish: '2025-09-30',
    scope: 'Supply field-grade sampling tools and accessories for geothermal exploration across Eastern Zone pilot areas.',
    docs: 'https://example.com/docs/TGDC-2024-G-001.zip',
  },
  {
    id: 2,
    ref: 'TGDC/2025/S/002',
    title: 'Provision of Environmental Consultancy Services (ESIA Support)',
    category: 'consultancy',
    status: 'open',
    deadline: '2025-11-05',
    publish: '2025-10-01',
    scope: 'Environmental and social support services for ESIA preparation and stakeholder engagement for identified prospects.',
    docs: 'https://example.com/docs/TGDC-2025-S-002.zip',
  },
  {
    id: 3,
    ref: 'TGDC/2025/W/003',
    title: 'Minor Civil Works for Pilot Facilities',
    category: 'works',
    status: 'closed',
    deadline: '2025-09-15',
    publish: '2025-08-20',
    scope: 'Construction of small shelters and pads in pilot locations for equipment housing.',
    docs: 'https://example.com/docs/TGDC-2025-W-003.zip',
    award: { winner: 'ABC Builders Ltd', date: '2025-09-25', amount: 'TZS 480,000,000' },
  },
  {
    id: 4,
    ref: 'TGDC/2025/S/004',
    title: 'Maintenance and Calibration of Monitoring Instruments',
    category: 'services',
    status: 'awarded',
    deadline: '2025-09-01',
    publish: '2025-07-25',
    scope: 'Routine maintenance, calibration, and certification of geothermal monitoring instruments.',
    docs: 'https://example.com/docs/TGDC-2025-S-004.zip',
    award: { winner: 'GeoCare Services', date: '2025-09-10', amount: 'TZS 120,000,000' },
  },
];

const procurementPlan: ProcurementPlanItem[] = [
  { ref: 'TGDC/PLN/001', title: 'Supply of Field Sampling Kits', category: 'Goods', quarter: 'Q1', notes: 'Standardized kits for multiple sites' },
  { ref: 'TGDC/PLN/002', title: 'Consultancy for ESIA Support', category: 'Consultancy', quarter: 'Q2', notes: 'Framework agreement planned' },
  { ref: 'TGDC/PLN/003', title: 'Civil Works: Small Structures', category: 'Works', quarter: 'Q3', notes: 'For pilot area facilities' },
];

function Procurement({ tenderData }: { tenderData: Tender[] }) {
    const [currentTab, setCurrentTab] = useState<string>('open');
    const [query, setQuery] = useState<string>('');
    const [category, setCategory] = useState<string>('all');
    const [status, setStatus] = useState<string>('open');
    const [sort, setSort] = useState<string>('deadline_asc');
    const [modal, setModal] = useState<{ open: boolean; tender: Tender | null; }>({ open: false, tender: null });
    const [toast, setToast] = useState<{ open: boolean; message: string; }>({ open: false, message: '' });

    const showToast = (message: string = 'Copied!') => {
        setToast({ open: true, message });
        setTimeout(() => setToast({ open: false, message: '' }), 1300);
    };

    const setTab = (tab: string) => {
        setCurrentTab(tab);
        if (tab === 'open') {
            setStatus('open');
        } else if (tab === 'closed') {
            setStatus('closed');
        }
    };

    const resetFilters = () => {
        setQuery('');
        setCategory('all');
        setStatus('open');
        setSort('deadline_asc');
        setTab('open');
    };

    const formatDate = (s: string): string => {
        const d = new Date(s);
        return isNaN(d.getTime()) ? s : d.toLocaleDateString();
    };

    const badgeFor = (t: string): string => {
        if (t === 'open') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        if (t === 'closed') return 'bg-gray-100 text-gray-700 border border-gray-200';
        return 'bg-blue-50 text-blue-700 border border-blue-100';
    };

    const catLabel = (c: string): string => c.charAt(0).toUpperCase() + c.slice(1);

    const filterSort = (items: Tender[]): Tender[] => {
        let out = items.filter((x) => {
            const matchesStatus = status === 'open' ? x.status === 'open' : x.status === 'closed' || x.status === 'awarded';
            const matchesCat = category === 'all' ? true : x.category === category;
            const text = `${x.title} ${x.ref} ${x.scope}`.toLowerCase();
            const matchesQuery = text.includes(query.toLowerCase().trim());
            return matchesStatus && matchesCat && matchesQuery;
        });
        out.sort((a, b) => {
            if (sort === 'deadline_asc') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            if (sort === 'deadline_desc') return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
            if (sort === 'title_asc') return a.title.localeCompare(b.title);
            if (sort === 'title_desc') return b.title.localeCompare(a.title);
            return 0;
        });
        return out;
    };

    const exportCSV = () => {
        const data = (tenderData && tenderData.length ? tenderData : tenders);
        const filtered = filterSort(data).filter((x) => (currentTab === 'open' ? x.status === 'open' : x.status !== 'open'));
        const rows = [
            ['Ref', 'Title', 'Category', 'Status', 'Publish Date', 'Deadline', 'Docs URL'],
            ...filtered.map((t) => [t.ref, t.title, catLabel(t.category), t.status, t.publish, t.deadline, t.docs]),
        ];
        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tenders_${currentTab}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const data = (tenderData && tenderData.length ? tenderData : tenders);
    const filteredTenders = filterSort(data);
    const openTenders = filteredTenders.filter((x) => x.status === 'open');
    const closedTenders = filteredTenders.filter((x) => x.status !== 'open');


    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen box-border">
            {/* Hero */}
            <section className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                        Procurement
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">Tenders and Opportunities</h1>
                    <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
                        Browse open tenders, view details, and download documents. Simple, clear, and up to date.
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <section className="py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                        <div className="flex flex-wrap gap-2">
                            {['open', 'closed', 'plan'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === tab ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
                                >
                                    {tab === 'open' ? 'Open Tenders' : tab === 'closed' ? 'Closed / Awarded' : 'Procurement Plan'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls */}
            <section className="pb-4">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Search</label>
                                <div className="relative">
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by title, ref, scope..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                                >
                                    <option value="all">All</option>
                                    <option value="goods">Goods</option>
                                    <option value="services">Services</option>
                                    <option value="works">Works</option>
                                    <option value="consultancy">Consultancy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setTab(e.target.value === 'open' ? 'open' : 'closed');
                                    } }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="awarded">Awarded</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Sort by</label>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                                >
                                    <option value="deadline_asc">Deadline (Soonest)</option>
                                    <option value="deadline_desc">Deadline (Latest)</option>
                                    <option value="title_asc">Title (A–Z)</option>
                                    <option value="title_desc">Title (Z–A)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={exportCSV} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
                                Export CSV
                            </button>
                            <button onClick={resetFilters} className="px-4 py-2 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Tenders List */}
            <section className={`${currentTab === 'open' ? 'block' : 'hidden'} pb-16`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="space-y-3">
                        {openTenders.map((t) => (
                            <div
                                key={t.id}
                                className="rounded-xl border bg-white p-4 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{t.title}</h3>
                                            <span className={`text-[11px] px-2 py-1 rounded-full ${badgeFor(t.status)}`}>
                                                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                            </span>
                                            <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                                                {catLabel(t.category)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Ref: {t.ref} • Published: {formatDate(t.publish)}</div>
                                        <p className="text-sm text-gray-700 mt-2">{t.scope}</p>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Deadline: <span className="font-medium text-gray-800">{formatDate(t.deadline)}</span>
                                        </div>
                                        {t.status === 'awarded' && t.award && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                Awarded to: <span className="font-medium text-gray-800">{t.award.winner}</span> • {formatDate(t.award.date)} • {t.award.amount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setModal({ open: true, tender: t })}
                                            className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                                        >
                                            View details
                                        </button>
                                        <Link
                                            href={t.docs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
                                        >
                                            Download
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {openTenders.length === 0 && (
                        <div className="p-4 rounded-xl border bg-gray-50 text-sm text-gray-600 mt-4">No matching open tenders found.</div>
                    )}
                </div>
            </section>

            {/* Closed/Awarded */}
            <section className={`${currentTab === 'closed' ? 'block' : 'hidden'} pb-16`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="space-y-3">
                        {closedTenders.map((t) => (
                            <div
                                key={t.id}
                                className="rounded-xl border bg-white p-4 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{t.title}</h3>
                                            <span className={`text-[11px] px-2 py-1 rounded-full ${badgeFor(t.status)}`}>
                                                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                            </span>
                                            <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                                                {catLabel(t.category)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Ref: {t.ref} • Published: {formatDate(t.publish)}</div>
                                        <p className="text-sm text-gray-700 mt-2">{t.scope}</p>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Deadline: <span className="font-medium text-gray-800">{formatDate(t.deadline)}</span>
                                        </div>
                                        {t.status === 'awarded' && t.award && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                Awarded to: <span className="font-medium text-gray-800">{t.award.winner}</span> • {formatDate(t.award.date)} • {t.award.amount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setModal({ open: true, tender: t })}
                                            className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                                        >
                                            View details
                                        </button>
                                        <Link
                                            href={t.docs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
                                        >
                                            Download
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {closedTenders.length === 0 && (
                        <div className="p-4 rounded-xl border bg-gray-50 text-sm text-gray-600 mt-4">No closed/awarded tenders found.</div>
                    )}
                </div>
            </section>

            {/* Procurement Plan */}
            <section className={`${currentTab === 'plan' ? 'block' : 'hidden'} pb-16`}>
                <div className="max-w-6xl mx-auto px-6 space-y-4">
                    <div className="bg-white rounded-2xl border p-5 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Annual Procurement Plan (Sample)</h2>
                                <p className="text-sm text-gray-600 mt-1">Planned items for the current financial year.</p>
                            </div>
                            <Link
                                href="https://example.com/procurement-plan.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                            >
                                Open PDF
                            </Link>
                        </div>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left py-2 px-3">Ref</th>
                                        <th className="text-left py-2 px-3">Title</th>
                                        <th className="text-left py-2 px-3">Category</th>
                                        <th className="text-left py-2 px-3">Quarter</th>
                                        <th className="text-left py-2 px-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {procurementPlan.map((item) => (
                                        <tr key={item.ref}>
                                            <td className="py-2 px-3">{item.ref}</td>
                                            <td className="py-2 px-3">{item.title}</td>
                                            <td className="py-2 px-3">{item.category}</td>
                                            <td className="py-2 px-3">{item.quarter}</td>
                                            <td className="py-2 px-3">{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Note: Replace sample links and rows with your official plan items and document URLs.
                    </p>
                </div>
            </section>

            {/* Tender Details Modal */}
            {modal.open && modal.tender && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setModal({ open: false, tender: null })}></div>
                    <div className="relative bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-start justify-between p-5 border-b">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{modal.tender.title}</h4>
                                <div className="text-xs text-gray-500 mt-1">
                                    {modal.tender.ref} • {catLabel(modal.tender.category)} •{' '}
                                    {modal.tender.status.charAt(0).toUpperCase() + modal.tender.status.slice(1)} • Deadline:{' '}
                                    {formatDate(modal.tender.deadline)}
                                </div>
                            </div>
                            <button
                                onClick={() => setModal({ open: false, tender: null })}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5 text-gray-700 leading-relaxed">
                            <div className="mb-3">
                                <span className="text-sm text-gray-500">Reference:</span>{' '}
                                <span className="font-medium">{modal.tender.ref}</span>
                            </div>
                            <div className="mb-3">
                                <span className="text-sm text-gray-500">Scope:</span>
                                <p className="mt-1">{modal.tender.scope}</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="text-xs text-gray-500">Published</div>
                                    <div className="font-semibold text-gray-800">{formatDate(modal.tender.publish)}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="text-xs text-gray-500">Deadline</div>
                                    <div className="font-semibold text-gray-800">{formatDate(modal.tender.deadline)}</div>
                                </div>
                            </div>
                            {modal.tender.status === 'awarded' && modal.tender.award && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="text-xs text-green-700">Award</div>
                                    <div className="text-sm text-green-900">
                                        Winner: <span className="font-semibold">{modal.tender.award.winner}</span> •{' '}
                                        {formatDate(modal.tender.award.date)} • {modal.tender.award.amount}
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-4">
                                Note: Bids are submitted through official channels as per instructions in the tender documents. This is an
                                information page only.
                            </p>
                        </div>
                        <div className="px-5 py-4 bg-gray-50 border-t flex flex-wrap items-center justify-end gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(modal.tender!.ref);
                                        showToast('Reference copied');
                                    } catch {
                                        showToast('Copy failed');
                                    }
                                } }
                                className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-100"
                            >
                                Copy Ref
                            </button>
                            <Link
                                href={modal.tender.docs}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                            >
                                Open Documents
                            </Link>
                            <button
                                onClick={() => setModal({ open: false, tender: null })}
                                className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg animate-[fade_0.25s_ease_both]">
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default Procurement;
