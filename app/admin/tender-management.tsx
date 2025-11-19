import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { NextPage } from 'next';
import Head from 'next/head';

// Register Chart.js components
Chart.register(...registerables);

// Define types for tender data
interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  bids: number;
  status: string;
  date: string;
  awardedTo?: string;
}

// Define types for vendor data
interface Vendor {
  name: string;
  category: string;
  contractsWon: number;
  totalValue: string;
  rating: number;
  status: string;
  registrationDate?: string;
}

// API Tender type
interface ApiTender {
  id: number;
  ref: string;
  title: string;
  category: string;
  status: string;
  deadline: string; // ISO
  publish: string;  // ISO
  scope: string;
  docs: string;
}

// Sample data (mirroring original HTML)
const recentTenders: Tender[] = [
  {
    id: 'TND-2024-001',
    title: 'Drilling Equipment Procurement',
    description: 'Advanced drilling rigs and monitoring equipment for Eastern Zone operations',
    category: 'Equipment',
    value: '$850,000',
    bids: 8,
    status: 'Open',
    date: 'Dec 20, 2024',
  },
  {
    id: 'TND-2024-005',
    title: 'Environmental Consulting Services',
    description: 'ESIA preparation and environmental monitoring for Luhoi site',
    category: 'Consulting',
    value: '$120,000',
    bids: 5,
    status: 'Awarded',
    date: 'Dec 10, 2024',
  },
  {
    id: 'TND-2024-004',
    title: 'Laboratory Testing Services',
    description: 'Geochemical analysis and rock sample testing',
    category: 'Services',
    value: '$45,000',
    bids: 12,
    status: 'Evaluation',
    date: 'In Progress',
  },
];

const activeTenders: Tender[] = [
  {
    id: 'TND-2024-001',
    title: 'Drilling Equipment Procurement',
    description: 'Procurement of advanced drilling rigs, monitoring equipment, and related accessories for geothermal exploration in Eastern Zone sites.',
    category: 'Equipment',
    value: '$850,000',
    bids: 8,
    status: 'Open',
    date: 'Dec 20, 2024',
  },
  {
    id: 'TND-2024-002',
    title: 'Site Security Services',
    description: '24/7 security services for geothermal exploration sites including personnel, equipment, and monitoring systems.',
    category: 'Services',
    value: '$180,000',
    bids: 6,
    status: 'Open',
    date: 'Dec 25, 2024',
  },
  {
    id: 'TND-2024-003',
    title: 'Transportation Services',
    description: 'Vehicle rental and transportation services for field teams and equipment to remote exploration sites.',
    category: 'Services',
    value: '$95,000',
    bids: 4,
    status: 'Open',
    date: 'Dec 30, 2024',
  },
];

const evaluationBids = [
  {
    bidder: 'GeoLab Solutions Ltd',
    submitted: 'Dec 1, 2024',
    amount: '$42,500',
    technicalScore: 85,
    financialScore: 90,
    totalScore: 87.5,
    status: 'Leading',
  },
  {
    bidder: 'TechAnalysis Corp',
    submitted: 'Nov 30, 2024',
    amount: '$38,900',
    technicalScore: 75,
    financialScore: 95,
    totalScore: 85.0,
    status: 'Competitive',
  },
  {
    bidder: 'Precision Labs Inc',
    submitted: 'Dec 2, 2024',
    amount: '$47,200',
    technicalScore: 92,
    financialScore: 78,
    totalScore: 85.0,
    status: 'Competitive',
  },
];

const archivedTenders: Tender[] = [
  {
    id: 'TND-2024-005',
    title: 'Environmental Consulting Services',
    category: 'Consulting',
    value: '$120,000',
    bids: 5,
    status: 'Awarded',
    awardedTo: 'EcoConsult Tanzania Ltd',
    date: 'Dec 10, 2024',
    description: 'helle desc'
  },
  {
    id: 'TND-2024-006',
    title: 'Site Preparation Services',
    category: 'Services',
    value: '$75,000',
    bids: 8,
    status: 'Awarded',
    awardedTo: 'BuildRight Construction',
    date: 'Dec 5, 2024',
    description: 'hello desc '
  },
  {
    id: 'TND-2024-007',
    title: 'Geological Survey Equipment',
    category: 'Equipment',
    value: '$320,000',
    bids: 6,
    status: 'Awarded',
    awardedTo: 'GeoTech Solutions',
    date: 'Nov 28, 2024',
    description: 'hello desc'
  },
];

const vendors: Vendor[] = [
  {
    name: 'GeoTech Solutions',
    category: 'Equipment Supplier',
    contractsWon: 3,
    totalValue: '$890,000',
    rating: 4.8,
    status: 'Verified',
  },
  {
    name: 'EcoConsult Tanzania Ltd',
    category: 'Environmental Services',
    contractsWon: 2,
    totalValue: '$195,000',
    rating: 4.6,
    status: 'Verified',
  },
  {
    name: 'SecureGuard Services',
    category: 'Security Services',
    contractsWon: 0,
    totalValue: '$0',
    rating: 0,
    status: 'Pending',
    registrationDate: 'Dec 12, 2024',
  },
];

// Hero Component
const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form (simplified for brevity)
  };

  return (
    <>
      <section className="bg-gradient-to-tr from-[#1f3f00]/80 via-[#326101]/60 to-transparent text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
                Procurement Management
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
                Tenders Management System
              </h1>
              <p className="text-white/90 text-lg mt-3 max-w-2xl">
                Create, publish, and manage procurement tenders for geothermal exploration equipment and services.
              </p>
            </div>
            <button
              onClick={openModal}
              className="bg-white text-[#326101] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Tender
            </button>
          </div>
        </div>
      </section>
      {isModalOpen && <NewTenderModal closeModal={closeModal} />}
    </>
  );
};

// Manage (CRUD) Section Component
const ManageTendersSection: React.FC = () => {
  const [rows, setRows] = useState<ApiTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = { ref: '', title: '', category: '', status: 'open', deadline: '', publish: '', scope: '', docs: '' };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/tender');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load tenders');
      const mapped: ApiTender[] = (data || []).map((r: any) => ({
        id: r.id,
        ref: r.ref,
        title: r.title,
        category: r.category,
        status: r.status,
        deadline: r.deadline,
        publish: r.publish,
        scope: r.scope,
        docs: r.docs,
      }));
      setRows(mapped);
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setOk(null);
    try {
      const payload = {
        ...form,
        deadline: form.deadline,
        publish: form.publish,
      };
      const res = await fetch(editingId ? `/api/tender/${editingId}` : '/api/tender', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      setOk(editingId ? 'Updated' : 'Created');
      setForm(emptyForm); setEditingId(null);
      load();
    } catch (e: any) {
      setErr(e.message || 'Error');
    }
  };

  const onEdit = (row: ApiTender) => {
    setEditingId(row.id);
    setForm({
      ref: row.ref,
      title: row.title,
      category: row.category,
      status: row.status,
      deadline: row.deadline ? new Date(row.deadline).toISOString().slice(0,10) : '',
      publish: row.publish ? new Date(row.publish).toISOString().slice(0,10) : '',
      scope: row.scope,
      docs: row.docs,
    });
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this tender?')) return;
    const res = await fetch(`/api/tender/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Tenders</h2>
            <p className="text-gray-600">Create, edit, and delete tender entries.</p>
          </div>
        </div>
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        {ok && <div className="mb-3 text-sm text-emerald-700">{ok}</div>}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-gray-700">Existing Tenders</div>
              {loading ? (
                <div className="p-4 text-gray-600">Loading…</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-xs font-semibold text-gray-700">Ref</th>
                      <th className="py-2 px-3 text-xs font-semibold text-gray-700">Title</th>
                      <th className="py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                      <th className="py-2 px-3 text-xs font-semibold text-gray-700">Deadline</th>
                      <th className="py-2 px-3 text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 px-3 text-sm">{r.ref}</td>
                        <td className="py-2 px-3 text-sm">{r.title}</td>
                        <td className="py-2 px-3 text-sm">{r.status}</td>
                        <td className="py-2 px-3 text-sm">{r.deadline ? new Date(r.deadline).toLocaleDateString() : ''}</td>
                        <td className="py-2 px-3 text-sm">
                          <div className="flex gap-3">
                            <button className="text-blue-600 hover:underline" onClick={() => onEdit(r)}>Edit</button>
                            <button className="text-red-600 hover:underline" onClick={() => onDelete(r.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr><td className="py-6 px-3 text-gray-600" colSpan={5}>No tenders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">{editingId ? 'Edit Tender' : 'New Tender'}</div>
              <form className="space-y-3" onSubmit={onSubmit}>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ref</label>
                  <input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-md">
                      <option value="open">open</option>
                      <option value="closed">closed</option>
                      <option value="awarded">awarded</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Publish Date</label>
                    <input type="date" value={form.publish} onChange={e => setForm({ ...form, publish: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Docs URL</label>
                  <input value={form.docs} onChange={e => setForm({ ...form, docs: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Scope</label>
                  <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} rows={4} required className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                </div>
                <div className="flex justify-end gap-2">
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-3 py-2 border border-gray-200 rounded-md">Cancel</button>
                  )}
                  <button className="px-3 py-2 rounded-md bg-[#326101] text-white">{editingId ? 'Save Changes' : 'Create Tender'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// New Tender Modal Component
const NewTenderModal: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Tender published successfully! Vendors will now be able to submit bids.');
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={closeModal}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h4 className="text-xl font-bold text-gray-900">Create New Tender</h4>
            <p className="text-sm text-gray-500 mt-1">Publish a new procurement opportunity</p>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tender Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="e.g., Drilling Equipment Procurement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="equipment">Equipment</option>
                <option value="services">Services</option>
                <option value="consulting">Consulting</option>
                <option value="construction">Construction</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value (USD)</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Closing Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Detailed description of the procurement requirements..."
            ></textarea>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="Vendor qualification requirements..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="Technical and financial evaluation criteria..."
              ></textarea>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="Procurement Officer Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                placeholder="procurement@tgdc.go.tz"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#639427]"
            >
              Publish Tender
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Navigation Tabs Component
const NavigationTabs: React.FC<{ currentTab: string; switchTab: (tab: string) => void }> = ({
  currentTab,
  switchTab,
}) => {
  const tabs = [ 'Manage'];

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab.toLowerCase().replace(' ', ''))}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-[#e8f5e8] ${
                  currentTab === tab.toLowerCase().replace(' ', '') ? 'bg-[linear-gradient(135deg,_#326101,_#639427)] text-white' : ''
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Dashboard Section Component
const DashboardSection: React.FC = () => {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Active Tenders</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">47</div>
                <div className="text-sm text-gray-600">Total Bids</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-600">Under Evaluation</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">$3.2M</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activity & Urgent Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Tenders</h3>
                <p className="text-sm text-gray-600">Latest procurement activities</p>
              </div>
              <button className="text-sm text-[#326101] hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentTenders.map((tender) => (
                <div key={tender.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tender.status === 'Open' ? 'bg-blue-100' : tender.status === 'Awarded' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <svg className={`w-5 h-5 ${tender.status === 'Open' ? 'text-blue-600' : tender.status === 'Awarded' ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tender.status === 'Open' ? 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' : tender.status === 'Awarded' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{tender.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{tender.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Value: {tender.value}</span>
                          <span>Bids: {tender.bids}</span>
                          <span>{tender.status === 'Evaluation' ? 'Evaluation' : 'Closes'}: {tender.date}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tender.status === 'Open' ? 'bg-blue-100 text-blue-800' : tender.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {tender.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Urgent Actions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">3 Tenders Closing Soon</div>
                    <div className="text-xs text-gray-600">Within next 48 hours</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">5 Evaluations Pending</div>
                    <div className="text-xs text-gray-600">Awaiting committee review</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">2 Awards to Process</div>
                    <div className="text-xs text-gray-600">Contracts ready for signing</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[linear-gradient(135deg,_#326101,_#639427)] rounded-2xl shadow-sm p-6 text-white animate-[fadeIn_0.4s_ease_both] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
              <h3 className="text-lg font-bold mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tenders Published</span>
                  <span className="text-xl font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bids Received</span>
                  <span className="text-xl font-bold">34</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contracts Awarded</span>
                  <span className="text-xl font-bold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Value</span>
                  <span className="text-xl font-bold">$1.2M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Active Tenders Section Component
const ActiveTendersSection: React.FC = () => {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Active Tenders</h2>
            <p className="text-gray-600">Currently open procurement opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search tenders..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:border-transparent"
            />
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option>All Categories</option>
              <option>Equipment</option>
              <option>Services</option>
              <option>Consulting</option>
            </select>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {activeTenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{tender.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Tender ID: {tender.id}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Open</span>
              </div>
              <p className="text-gray-700 mb-4">{tender.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Estimated Value</div>
                  <div className="font-semibold text-gray-900">{tender.value}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bids Received</div>
                  <div className="font-semibold text-gray-900">{tender.bids}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Published</div>
                  <div className="font-semibold text-gray-900">{tender.date === 'Dec 20, 2024' ? 'Nov 15, 2024' : tender.date === 'Dec 25, 2024' ? 'Nov 20, 2024' : 'Nov 25, 2024'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Closing Date</div>
                  <div className={`font-semibold ${tender.date === 'Dec 20, 2024' ? 'text-red-600' : 'text-gray-900'}`}>{tender.date}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#326101] h-2 rounded-full"
                      style={{ width: tender.date === 'Dec 20, 2024' ? '75%' : tender.date === 'Dec 25, 2024' ? '60%' : '45%' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{tender.date === 'Dec 20, 2024' ? '5 days left' : tender.date === 'Dec 25, 2024' ? '10 days left' : '15 days left'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-[#326101] hover:underline">View Details</button>
                  <button className="text-sm text-gray-600 hover:underline">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Evaluation Section Component
const EvaluationSection: React.FC = () => {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bid Evaluation</h2>
            <p className="text-gray-600">Review and evaluate submitted bids</p>
          </div>
          <button className="px-4 py-2 bg-[#326101] text-white rounded-lg text-sm font-semibold hover:bg-[#639427]">
            Evaluation Committee
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Laboratory Testing Services</h3>
              <p className="text-sm text-gray-600">Tender ID: TND-2024-004 • 12 Bids Received</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Under Evaluation
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left py-3 px-4 rounded-l-lg">Bidder</th>
                  <th className="text-left py-3 px-4">Bid Amount</th>
                  <th className="text-left py-3 px-4">Technical Score</th>
                  <th className="text-left py-3 px-4">Financial Score</th>
                  <th className="text-left py-3 px-4">Total Score</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluationBids.map((bid, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{bid.bidder}</div>
                      <div className="text-xs text-gray-500">Submitted: {bid.submitted}</div>
                    </td>
                    <td className="py-3 px-4">{bid.amount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${bid.technicalScore >= 85 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${bid.technicalScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{bid.technicalScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${bid.financialScore >= 85 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${bid.financialScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{bid.financialScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${bid.totalScore >= 87 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {bid.totalScore}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bid.status === 'Leading' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600">
              Evaluation Progress: <span className="font-semibold">8 of 12 bids evaluated</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                Export Results
              </button>
              <button className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#639427]">
                Complete Evaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Archive Section Component
const ArchiveSection: React.FC = () => {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tender Archive</h2>
            <p className="text-gray-600">Completed and closed procurement processes</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search archive..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:border-transparent"
            />
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option>All Status</option>
              <option>Awarded</option>
              <option>Cancelled</option>
              <option>Expired</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left py-3 px-4 rounded-l-lg">Tender</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Bids</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Awarded To</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {archivedTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{tender.title}</div>
                      <div className="text-xs text-gray-500">{tender.id}</div>
                    </td>
                    <td className="py-3 px-4">{tender.category}</td>
                    <td className="py-3 px-4">{tender.value}</td>
                    <td className="py-3 px-4">{tender.bids}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {tender.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{tender.awardedTo}</td>
                    <td className="py-3 px-4">{tender.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

// Vendors Section Component
const VendorsSection: React.FC = () => {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
            <p className="text-gray-600">Registered suppliers and service providers</p>
          </div>
          <button className="px-4 py-2 bg-[#326101] text-white rounded-lg text-sm font-semibold hover:bg-[#639427]">
            Add Vendor
          </button>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {vendors.map((vendor, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.category}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {vendor.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{vendor.registrationDate ? 'Registration Date' : 'Contracts Won'}</span>
                  <span className="font-semibold">{vendor.registrationDate || vendor.contractsWon}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-semibold">{vendor.totalValue}</span>
                </div>
                {!vendor.registrationDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Performance Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{vendor.rating}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 fill-current ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="w-full text-center py-2 text-sm text-[#326101] border border-[#326101] rounded-lg hover:bg-[#e8f5e8]">
                {vendor.status === 'Pending' ? 'Review Application' : 'View Profile'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Reports Section Component
const ReportsSection: React.FC = () => {
  useEffect(() => {
    const tenderCtx = document.getElementById('tenderChart') as HTMLCanvasElement;
    const spendingCtx = document.getElementById('spendingChart') as HTMLCanvasElement;

    const tenderChart = new Chart(tenderCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Published',
            data: [8, 12, 6, 15, 10, 14],
            backgroundColor: '#326101',
          },
          {
            label: 'Awarded',
            data: [6, 10, 5, 12, 8, 11],
            backgroundColor: '#639427',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      },
    });

    const spendingChart = new Chart(spendingCtx, {
      type: 'doughnut',
      data: {
        labels: ['Equipment', 'Services', 'Consulting', 'Construction', 'Supplies'],
        datasets: [
          {
            data: [1200000, 800000, 400000, 600000, 200000],
            backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });

    return () => {
      tenderChart.destroy();
      spendingChart.destroy();
    };
  }, []);

  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Procurement Reports</h2>
            <p className="text-gray-600">Analytics and insights on tender performance</p>
          </div>
          <button className="px-4 py-2 bg-[#326101] text-white rounded-lg text-sm font-semibold hover:bg-[#639427]">
            Generate Report
          </button>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Tender Activity</h3>
                <p className="text-sm text-gray-600">Published vs Awarded tenders</p>
              </div>
            </div>
            <div className="h-64">
              <canvas id="tenderChart"></canvas>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
                <p className="text-sm text-gray-600">Budget allocation across categories</p>
              </div>
            </div>
            <div className="h-64">
              <canvas id="spendingChart"></canvas>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="text-2xl font-bold text-[#326101]">94%</div>
            <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            <div className="text-xs text-gray-500 mt-2">Tenders awarded</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="text-2xl font-bold text-[#326101]">18</div>
            <div className="text-sm text-gray-600 mt-1">Avg Days</div>
            <div className="text-xs text-gray-500 mt-2">Evaluation time</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="text-2xl font-bold text-[#326101]">6.2</div>
            <div className="text-sm text-gray-600 mt-1">Avg Bids</div>
            <div className="text-xs text-gray-500 mt-2">Per tender</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-in-out">
            <div className="text-2xl font-bold text-[#326101]">12%</div>
            <div className="text-sm text-gray-600 mt-1">Cost Savings</div>
            <div className="text-xs text-gray-500 mt-2">Below estimates</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main App Component
const TenderManagement: NextPage = () => {
  const [currentTab, setCurrentTab] = useState('manage');

  const switchTab = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 box-border">
      <Head>
        <title>TGDC – Tenders Management</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </Head>
      <Hero />
      <NavigationTabs currentTab={currentTab} switchTab={switchTab} />
      {currentTab === 'dashboard' && <DashboardSection />}
      {currentTab === 'manage' && <ManageTendersSection />}
      {currentTab === 'activetenders' && <ActiveTendersSection />}
      {currentTab === 'evaluation' && <EvaluationSection />}
      {currentTab === 'archive' && <ArchiveSection />}
      {currentTab === 'vendors' && <VendorsSection />}
      {currentTab === 'reports' && <ReportsSection />}
    </div>
  );
};

export default TenderManagement;
