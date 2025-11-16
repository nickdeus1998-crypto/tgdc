
'use client';

import React, { useState, useEffect, ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectManagement from './project-management/ProjectManagement';
import TenderManagement from './tender-management';
import HeroPage from './web-management/HeroPage';
import Dashboard from './dashboard/Dashboard';
import StatsSectionPage from './web-management/StatsSectionPage';
import { Stats } from 'fs';
import ServicesSectionPage from './web-management/ServicesSectionPage';
import SustainabilityPage from './web-management/SustainabilityPage';
import InformationCenterPage from './web-management/InformationCenterPage';
import GeothermalSitesPage from './web-management/GeothermalSitesPage';
import FooterSettingsPage from './web-management/FooterSettingsPage';
import AboutUsPage from './web-management/AboutUsPage';
import ProjectHighlightsPage from './web-management/ProjectHighlightsPage';
import ImpactHighlightsAdminPage from './web-management/ImpactHighlightsPage';
import OrgStructureAdminPage from './web-management/OrgStructurePage';
import UsersPage from './user-management/UsersPage';
// TypeScript interfaces
interface PageData {
  title: string;
  description: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

interface DashboardCard {
  title: string;
  value: string;
  subtext: string;
  gradient: string;
}

// Stakeholders page
const StakeholdersPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [items, setItems] = useState<Array<{ id: number; name: string; email: string; company?: string | null; phone?: string | null; createdAt: string; _count: { messages: number; documents: number } }>>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [msgs, setMsgs] = useState<Array<{ id: number; subject: string; content: string; sentAt: string; senderRole: 'admin' | 'stakeholder' }>>([])
  const [docs, setDocs] = useState<Array<{ id: number; filename: string; storagePath: string; sizeBytes: number; uploadedAt: string }>>([])
  const [msgCursor, setMsgCursor] = useState<number | null>(null)
  const [docCursor, setDocCursor] = useState<number | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stakeholders')
        if (!res.ok) throw new Error('Failed to load stakeholders')
        const data = await res.json()
        setItems(data.items || [])
        if (data.items?.[0]) setSelectedId(data.items[0].id)
        setLoading(false)
      } catch (e: any) {
        setErr(e?.message || 'error')
        setLoading(false)
      }
    })()
  }, [])

  const loadDetails = async (id: number) => {
    try {
      const [m, d] = await Promise.all([
        fetch(`/api/admin/stakeholders/${id}/messages?limit=10`),
        fetch(`/api/admin/stakeholders/${id}/documents?limit=10`),
      ])
      if (m.ok) { const mj = await m.json(); setMsgs(mj.items || []); setMsgCursor(mj.nextCursor ?? null) }
      if (d.ok) { const dj = await d.json(); setDocs(dj.items || []); setDocCursor(dj.nextCursor ?? null) }
    } catch {}
  }

  useEffect(() => { if (selectedId) loadDetails(selectedId) }, [selectedId])

  useEffect(() => {
    setReplySubject('')
    setReplyContent('')
    setSendStatus(null)
  }, [selectedId])

  const loadMoreMsgs = async () => {
    if (!selectedId || !msgCursor) return
    const res = await fetch(`/api/admin/stakeholders/${selectedId}/messages?limit=10&cursor=${msgCursor}`)
    if (res.ok) {
      const data = await res.json();
      setMsgs(prev => [...prev, ...(data.items || [])]);
      setMsgCursor(data.nextCursor ?? null);
    }
  }
  const loadMoreDocs = async () => {
    if (!selectedId || !docCursor) return
    const res = await fetch(`/api/admin/stakeholders/${selectedId}/documents?limit=10&cursor=${docCursor}`)
    if (res.ok) {
      const data = await res.json();
      setDocs(prev => [...prev, ...(data.items || [])]);
      setDocCursor(data.nextCursor ?? null);
    }
  }

  const sendReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedId || !replySubject.trim() || !replyContent.trim()) {
      setSendStatus({ type: 'error', message: 'Subject and message are required.' })
      return
    }
    setSendingReply(true)
    setSendStatus(null)
    try {
      const res = await fetch(`/api/admin/stakeholders/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: replySubject.trim(), content: replyContent.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setSendStatus({ type: 'error', message: data?.error || 'Failed to send reply.' })
        return
      }
      setReplySubject('')
      setReplyContent('')
      setSendStatus({ type: 'success', message: 'Reply sent successfully.' })
      await loadDetails(selectedId)
    } catch {
      setSendStatus({ type: 'error', message: 'Failed to send reply.' })
    } finally {
      setSendingReply(false)
    }
  }

  const canSendReply = Boolean(selectedId && replySubject.trim() && replyContent.trim())

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Stakeholders</h2>
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            <ul className="divide-y divide-gray-100 max-h-[600px] overflow-auto">
              {items.map(it => (
                <li key={it.id}>
                  <button className={`w-full text-left p-3 hover:bg-gray-50 ${selectedId===it.id ? 'bg-gray-50' : ''}`} onClick={() => setSelectedId(it.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{it.name}</p>
                        <p className="text-xs text-gray-500">{it.email}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{it._count.messages} msgs</div>
                        <div>{it._count.documents} docs</div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {!loading && items.length === 0 && (
                <li className="p-3 text-sm text-gray-500">No stakeholders found.</li>
              )}
            </ul>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Messages</h3>
              {msgs.length === 0 ? (
                <p className="text-sm text-gray-500">No messages.</p>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-auto pr-1">
                  {msgs.map(m => {
                    const isAdminMessage = m.senderRole === 'admin'
                    return (
                      <li
                        key={m.id}
                        className={`rounded-md p-3 border ${isAdminMessage ? 'border-emerald-200 bg-emerald-50/70' : 'border-gray-200 bg-white'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isAdminMessage ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                              {isAdminMessage ? 'TGDC' : 'Stakeholder'}
                            </span>
                            <p className="font-medium text-gray-900 text-sm break-words">{m.subject}</p>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(m.sentAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{m.content}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
              {msgCursor && (
                <div className="mt-3">
                  <button onClick={loadMoreMsgs} className="text-sm text-emerald-700 hover:underline">Load more</button>
                </div>
              )}
              <form onSubmit={sendReply} className="mt-6 border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Reply to stakeholder</h4>
                  {sendStatus && (
                    <span className={`text-xs ${sendStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {sendStatus.message}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  disabled={!selectedId || sendingReply}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50"
                />
                <textarea
                  placeholder="Write your reply"
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  disabled={!selectedId || sendingReply}
                  rows={4}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setReplySubject(''); setReplyContent(''); setSendStatus(null) }}
                    disabled={sendingReply || (!replySubject && !replyContent)}
                    className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={!canSendReply || sendingReply}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:opacity-50"
                  >
                    {sendingReply ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Documents</h3>
              {docs.length === 0 ? (
                <p className="text-sm text-gray-500">No documents.</p>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-auto pr-1">
                  {docs.map(d => (
                    <li key={d.id} className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{d.filename}</p>
                        <p className="text-xs text-gray-500">{(d.sizeBytes / 1024).toFixed(1)} KB • {new Date(d.uploadedAt).toLocaleString()}</p>
                      </div>
                      <a href={d.storagePath} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 hover:underline">Download</a>
                    </li>
                  ))}
                </ul>
              )}
              {docCursor && (
                <div className="mt-3">
                  <button onClick={loadMoreDocs} className="text-sm text-emerald-700 hover:underline">Load more</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple inline chart component for daily series
function TrafficChart({ series }: { series: { date: string; pageviews: number; visitors: number }[] }) {
  const w = 700, h = 180, pad = 20
  const n = series.length || 1
  const maxV = Math.max(1, ...series.map(s => Math.max(s.pageviews, s.visitors)))
  const x = (i: number) => pad + (i * (w - 2*pad)) / Math.max(1, n - 1)
  const y = (v: number) => h - pad - (v * (h - 2*pad)) / maxV
  const pvPts = series.map((s, i) => `${x(i)},${y(s.pageviews)}`).join(' ')
  const visPts = series.map((s, i) => `${x(i)},${y(s.visitors)}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="rounded-lg border border-gray-100 bg-gray-50">
      <polyline points={pvPts} fill="none" stroke="#6366f1" strokeWidth="2" />
      <polyline points={visPts} fill="none" stroke="#14b8a6" strokeWidth="2" />
      <text x={pad} y={12} fontSize="10" fill="#6366f1">Pageviews</text>
      <text x={pad+80} y={12} fontSize="10" fill="#14b8a6">Visitors</text>
    </svg>
  )
}

// Page data
const pageData: Record<string, PageData> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Welcome to the TGDC Admin Panel. Manage your geothermal projects and website content.',
  },
  analytics: {
    title: 'Analytics',
    description: 'Live counts for content and stakeholders. Trends coming soon.',
  },
  stakeholders: {
    title: 'Stakeholders',
    description: 'Browse stakeholder accounts, messages, and documents.',
  },
  users: {
    title: 'Admin Users',
    description: 'Create, edit, and disable CMS administrator accounts.',
  },
  header: {
    title: 'Header Settings',
    description: 'Manage website header, navigation menu, and branding elements.',
  },
  hero: {
    title: 'Hero Section',
    description: 'Edit the main hero section content, images, and call-to-action buttons.',
  },
  about: {
    title: 'About Us',
    description: 'Manage the about us section content, team information, and company details.',
  },
  stats: {
    title: 'Stats ',
    description: 'Manage the about us section content, team information, and company details.',
  },
  
  geosites: { title: 'Geothermal Sites', description: 'Manage geothermal sites, zones, and map coordinates.' },
sustainability: {
    title: 'Sustainability',
    description: 'Manage sustainability projects (ESIA) and partner stakeholders.',
  },
  services: {
    title: 'Services',
    description: 'Edit services offered, descriptions, and service-related content.',
  },
  portfolio: {
    title: 'Projects Portfolio',
    description: 'Manage project portfolio, case studies, and project galleries.',
  },
  impactHighlights: {
    title: 'Impact Highlights',
    description: 'Manage carousel entries for homepage impact highlights.',
  },
  orgStructure: {
    title: 'Org Structure',
    description: 'Manage leadership cards shown on the About Us page.',
  },
  projectHighlights: {
    title: 'Project Highlights',
    description: 'Create and edit the featured geothermal projects shown on the homepage.',
  },
  news: {
    title: 'News & Updates',
    description: 'Create and manage news articles, press releases, and company updates.',
  },
  contact: {
    title: 'Contact Information',
    description: 'Update contact details, office locations, and contact forms.',
  },
  footer: {
    title: 'Footer Settings',
    description: 'Manage footer content, links, social media, and legal information.',
  },
  projects: {
    title: 'Projects Management',
    description: 'Create, edit, and manage geothermal projects and their details.',
  },
  tenders: {
    title: 'Tenders Management',
    description: 'Manage tender documents, applications, and procurement processes.',
  },
  media: {
    title: 'Media Gallery',
    description: 'Upload and organize photos, videos, and other media files.',
  },
  settings: {
    title: 'System Settings',
    description: 'Configure system preferences, user accounts, and security settings.',
  },
};

// Page Components
const DashboardPage: React.FC = () => {
  const dashboardCards: DashboardCard[] = [
    {
      title: 'Total Projects',
      value: '24',
      subtext: '+2 this month',
      gradient: 'from-[#326101] to-[#639427]',
    },
    {
      title: 'Active Tenders',
      value: '8',
      subtext: '3 closing soon',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Media Files',
      value: '156',
      subtext: '12 added today',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Website Views',
      value: '14.2K',
      subtext: '+8% this week',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const recentActivities = [
    {
      title: 'Ngozi Project Updated',
      description: 'Construction progress updated to 75%',
      time: '2 hours ago',
      color: 'bg-[#326101]',
      icon: <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />,
    },
    {
      title: 'New Tender Published',
      description: 'Kilimanjaro Geothermal Equipment Procurement',
      time: '4 hours ago',
      color: 'bg-blue-500',
      icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />,
    },
    {
      title: 'Media Gallery Updated',
      description: '12 new project photos uploaded',
      time: '6 hours ago',
      color: 'bg-purple-500',
      icon: <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <div key={index} className={`bg-gradient-to-br ${card.gradient} text-white p-6 rounded-xl shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-green-100 text-sm mt-1">{card.subtext}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {activity.icon}
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* header page begins later */

// Analytics Page (live metrics)
const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [data, setData] = React.useState<{
    news: number; users: number; stakeholders: number;
    messages: { user: number; stakeholder: number };
    documents: number; services: { sections: number; services: number };
    pageviews7d: number; visitors7d: number;
  } | null>(null);
  const [series7, setSeries7] = React.useState<{ date: string; pageviews: number; visitors: number }[] | null>(null);
  const [series30, setSeries30] = React.useState<{ date: string; pageviews: number; visitors: number }[] | null>(null);
  const [top7, setTop7] = React.useState<{ path: string; pageviews: number; visitors: number }[] | null>(null);
  const [top30, setTop30] = React.useState<{ path: string; pageviews: number; visitors: number }[] | null>(null);
  const [range, setRange] = React.useState<7 | 30>(7);
  const [grain, setGrain] = React.useState<'day'|'month'|'year'>('day');
  const [from, setFrom] = React.useState<string>('');
  const [to, setTo] = React.useState<string>('');
  const [useCustom, setUseCustom] = React.useState<boolean>(false);
  const [seriesCustom, setSeriesCustom] = React.useState<{ date: string; pageviews: number; visitors: number }[] | null>(null);
  const [topCustom, setTopCustom] = React.useState<{ path: string; pageviews: number; visitors: number }[] | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [s, u, v, tp7, tp30] = await Promise.all([
          fetch('/api/analytics/summary'),
          fetch('/api/analytics/timeseries?days=7'),
          fetch('/api/analytics/timeseries?days=30'),
          fetch('/api/analytics/top-pages?days=7'),
          fetch('/api/analytics/top-pages?days=30'),
        ]);
        if (!s.ok || !u.ok || !v.ok || !tp7.ok || !tp30.ok) throw new Error('Failed to load analytics');
        const summary = await s.json();
        const ts7 = await u.json();
        const ts30 = await v.json();
        const list7 = await tp7.json();
        const list30 = await tp30.json();
        if (isMounted) {
          setData(summary);
          setSeries7(ts7.series || []);
          setSeries30(ts30.series || []);
          setTop7(list7.list || []);
          setTop30(list30.list || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (isMounted) { setErr(e?.message || 'error'); setLoading(false); }
      }
    })();
    return () => { isMounted = false };
  }, []);

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      params.set('grain', grain);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const [ts, tp] = await Promise.all([
        fetch(`/api/analytics/timeseries?${params.toString()}`),
        fetch(`/api/analytics/top-pages?${new URLSearchParams({ ...(from?{from}:{}), ...(to?{to}:{}) }).toString()}`),
      ]);
      if (!ts.ok || !tp.ok) throw new Error('Failed to apply filters');
      const tsj = await ts.json();
      const tpj = await tp.json();
      setSeriesCustom(tsj.series || []);
      setTopCustom(tpj.list || []);
      setUseCustom(true);
    } catch (e: any) {
      setErr(e?.message || 'Failed to apply filters');
    }
  };

  const clearFilters = () => {
    setUseCustom(false);
  };

  const pvCustom = useCustom && seriesCustom ? seriesCustom.reduce((a, b) => a + (b.pageviews || 0), 0) : null;
  const visCustom = useCustom && seriesCustom ? seriesCustom.reduce((a, b) => a + (b.visitors || 0), 0) : null;
  const dateSubtext = useCustom ? ((from && to) ? `${from} → ${to}` : 'Filtered range') : 'Last 7 days';

  const cards: DashboardCard[] = data ? [
    { title: useCustom ? 'Page Views' : 'Page Views (7d)', value: String(pvCustom ?? data.pageviews7d), subtext: dateSubtext, gradient: 'from-indigo-500 to-indigo-600' },
    { title: useCustom ? 'Visitors' : 'Visitors (7d)', value: String(visCustom ?? data.visitors7d), subtext: dateSubtext, gradient: 'from-teal-500 to-teal-600' },
    { title: 'News Articles', value: String(data.news), subtext: 'Total in CMS', gradient: 'from-[#326101] to-[#639427]' },
    { title: 'Users (Admin)', value: String(data.users), subtext: 'Registered admins', gradient: 'from-blue-500 to-blue-600' },
    { title: 'Stakeholders', value: String(data.stakeholders), subtext: 'Portal accounts', gradient: 'from-purple-500 to-purple-600' },
    { title: 'Documents', value: String(data.documents), subtext: 'Uploaded by stakeholders', gradient: 'from-orange-500 to-red-500' },
   ] : [
    { title: 'Page Views (7d)', value: '�', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-indigo-500 to-indigo-600' },
    { title: 'Visitors (7d)', value: '�', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-teal-500 to-teal-600' },
    { title: 'News Articles', value: '-', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-[#326101] to-[#639427]' },
    { title: 'Users (Admin)', value: '-', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-blue-500 to-blue-600' },
    { title: 'Stakeholders', value: '-', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-purple-500 to-purple-600' },
    { title: 'Documents', value: '-', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-orange-500 to-red-500' },
  ];

  const topList = data ? [
    { label: 'User messages', value: data.messages.user },
    { label: 'Stakeholder messages', value: data.messages.stakeholder },
    { label: 'Service sections', value: data.services.sections },
    { label: 'Services', value: data.services.services },
   ] : [
    { title: 'Page Views (7d)', value: '�', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-indigo-500 to-indigo-600' },
    { title: 'Visitors (7d)', value: '�', subtext: loading ? 'Loading...' : 'Unavailable', gradient: 'from-teal-500 to-teal-600' },];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {cards.map((card, i) => (
            <div key={i} className={`bg-gradient-to-br ${card.gradient} text-white p-6 rounded-xl shadow-lg`}>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-green-100 text-sm mt-1">{card.subtext}</p>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Granularity</label>
              <select value={grain} onChange={e => setGrain(e.target.value as any)} className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white text-gray-900">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white text-gray-900 placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={applyFilters} className="bg-[#326101] hover:bg-[#2a5200] text-white text-sm font-semibold rounded-md px-3 py-2">Apply</button>
              {useCustom && (
                <button onClick={clearFilters} className="text-sm text-gray-600 underline">Clear</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Traffic Overview</h2>
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                <button onClick={() => { setRange(7); setUseCustom(false); }} className={`px-3 py-1 text-sm ${!useCustom && range===7 ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>7d</button>
                <button onClick={() => { setRange(30); setUseCustom(false); }} className={`px-3 py-1 text-sm ${!useCustom && range===30 ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>30d</button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Pageviews and visitors ({useCustom ? grain : 'day'})</p>
            <TrafficChart series={(useCustom ? (seriesCustom||[]) : (range===7 ? (series7||[]) : (series30||[])))} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Top Pages</h2>
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                <button onClick={() => { setRange(7); setUseCustom(false); }} className={`px-3 py-1 text-sm ${!useCustom && range===7 ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>7d</button>
                <button onClick={() => { setRange(30); setUseCustom(false); }} className={`px-3 py-1 text-sm ${!useCustom && range===30 ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>30d</button>
              </div>
            </div>
            <div className="space-y-2">
              {(useCustom ? (topCustom||[]) : (range===7 ? (top7||[]) : (top30||[]))).slice(0,8).map((p) => (
                <div key={`${p.path}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700 truncate max-w-[60%]" title={p.path}>{p.path}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{p.pageviews.toLocaleString()} pv</span>
                    <span className="font-semibold text-gray-900">{p.visitors.toLocaleString()} vis</span>
                  </div>
                </div>
              ))}
              {((useCustom ? (topCustom||[]) : (range===7 ? (top7||[]) : (top30||[]))).length === 0) && (
                <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'No data'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const HeaderPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Header Settings</h2>
        <p className="text-gray-600 mb-4">Configure navigation menu, logo, and branding elements.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter site title"
              defaultValue="TGDC Official Website"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Navigation Links</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              rows={4}
              placeholder="Enter navigation links (JSON format)"
              defaultValue='["Home", "About", "Services", "Projects", "Contact"]'
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
);


const AboutPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">About Us</h2>
        <p className="text-gray-600 mb-4">Manage team information and company details.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Mission</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              rows={4}
              placeholder="Enter company mission"
              defaultValue="To harness geothermal energy for a sustainable future."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
);



const PortfolioPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Projects Portfolio</h2>
        <p className="text-gray-600 mb-4">Manage project case studies and galleries.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Project</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter featured project name"
              defaultValue="Ngozi Geothermal Project"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NewsPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">News & Updates</h2>
        <p className="text-gray-600 mb-4">Create and manage news articles.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latest Article Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter article title"
              defaultValue="New Geothermal Site Discovered"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
        <p className="text-gray-600 mb-4">Update contact details and office locations.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter office address"
              defaultValue="123 Geothermal Ave, Dar es Salaam"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FooterPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Footer Settings</h2>
        <p className="text-gray-600 mb-4">Manage footer content and social media links.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              rows={4}
              placeholder="Enter social media links (JSON format)"
              defaultValue='["Twitter", "LinkedIn", "Facebook"]'
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// const ProjectsPage: React.FC = () => (
//   <div className="p-6 lg:p-8">
//     <div className="max-w-7xl mx-auto">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h2 className="text-xl font-bold text-gray-900 mb-6">Projects Management</h2>
//         <p className="text-gray-600 mb-4">Create and manage geothermal projects.</p>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
//               placeholder="Enter project name"
//               defaultValue="Kisaki Geothermal Survey"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

const TendersPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tenders Management</h2>
        <p className="text-gray-600 mb-4">Manage tender documents and procurement processes.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tender Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter tender title"
              defaultValue="Equipment Procurement 2025"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MediaPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Media Gallery</h2>
        <p className="text-gray-600 mb-4">Upload and organize media files.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
        <p className="text-gray-600 mb-4">Configure user accounts and security settings.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              placeholder="Enter admin email"
              defaultValue="admin@tgdc.go.tz"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Page component mapping
const pageComponents: Record<string, ComponentType> = {
  dashboard: Dashboard,
  analytics: AnalyticsPage,
  stakeholders: StakeholdersPage,
  users: UsersPage,

  header: HeaderPage,
  hero: HeroPage,
  stats: StatsSectionPage,
  sustainability: SustainabilityPage,
  information: InformationCenterPage,
  geosites: GeothermalSitesPage,
  about: AboutUsPage,
  services: ServicesSectionPage,
  portfolio: PortfolioPage,
  impactHighlights: ImpactHighlightsAdminPage,
  orgStructure: OrgStructureAdminPage,
  projectHighlights: ProjectHighlightsPage,
  news: NewsPage,
  contact: ContactPage,
  footer: FooterSettingsPage,
  projects: ProjectManagement,
  tenders: TenderManagement,
  media: MediaPage,
  settings: SettingsPage,
};

// Components
const Logo: React.FC = () => (
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-gradient-to-br from-[#326101] to-[#639427] rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-xl font-bold text-gray-900">TGDC</h1>
      <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
    </div>
  </div>
);

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setNotificationCount((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        className="p-2 text-gray-600 hover:text-[#326101] hover:bg-green-50 rounded-lg transition-colors duration-200 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          {notificationCount}
        </span>
      </button>
      <div className={`absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 ${isOpen ? 'dropdown-enter dropdown-enter-active' : 'hidden'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <span className="text-sm text-gray-500">{notificationCount} new</span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {[
            { title: 'Ngozi Project Update', description: 'Construction phase 75% completed', time: '2 hours ago', color: 'bg-[#326101]' },
            { title: 'New User Registration', description: 'John Doe requested access', time: '4 hours ago', color: 'bg-blue-500' },
            { title: 'System Maintenance', description: 'Scheduled for tonight at 2 AM', time: '6 hours ago', color: 'bg-yellow-500' },
          ].map((notification, index) => (
            <div key={index} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 ${notification.color} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button className="w-full text-center text-sm text-[#326101] hover:text-[#639427] font-medium">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string | null; email: string; role?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const initials = (user?.name || user?.email || 'AD')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-br from-[#326101] to-[#639427]">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
          <p className="text-xs text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 ${isOpen ? 'dropdown-enter dropdown-enter-active' : 'hidden'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="user-avatar w-10 h-10 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-[#326101] to-[#639427]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@tgdc.go.tz'}</p>
            </div>
          </div>
        </div>
        <div className="py-2">
          {[
            { href: '#', text: 'Profile Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
            { href: '#', text: 'Account Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
            { href: '#', text: 'Help & Support', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          ].map((item, index) => (
            <a key={index} href={item.href} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.text}
            </a>
          ))}
        </div>
        <div className="border-t border-gray-100 py-2">
          <button onClick={signOut} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; activePage: string; setActivePage: (page: string) => void }> = ({
  isOpen,
  toggleSidebar,
  activePage,
  setActivePage,
}) => {
  const [isWebSubmenuOpen, setIsWebSubmenuOpen] = useState(false);

  const navItems = [
    { page: 'dashboard', text: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" /> },
    { page: 'analytics', text: 'Analytics', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { page: 'stakeholders', text: 'Stakeholders', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H7v-2a4 4 0 014-4h0m0 0a4 4 0 110-8 4 4 0 010 8z" /> },
    { page: 'users', text: 'Admin Users', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8a3 3 0 116 0 3 3 0 01-6 0zm8 0a3 3 0 116 0 3 3 0 01-6 0zM4 16a4 4 0 018 0v2H4v-2zm8 0a4 4 0 018 0v2h-8v-2z" /> },
    {
      page: 'web',
      text: 'Web Management',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 01-9-9m9 9c0 5-4 9-9 9s-9-4-9-9m9 9c0-5 4-9 9-9s9 4 9 9" />,
      submenu: [
        { page: 'header', text: 'Header Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
        { page: 'hero', text: 'Hero Section', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" /> },
        { page: 'about', text: 'About Us', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { page: 'information', text: 'Information Center', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h10M4 14h8M4 18h6" /> },
        { page: 'geosites', text: 'Geothermal Sites', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V5a2 2 0 012-2h16a2 2 0 012 2v10.382a2 2 0 01-1.553 1.894L15 20l-6 0z" /> },
        { page: 'sustainability', text: 'Sustainability', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14a4 4 0 114-4H8a4 4 0 013 4z" /> },
        { page: 'stats', text: 'Stats ', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { page: 'services', text: 'Services', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
        { page: 'portfolio', text: 'Projects Portfolio', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
        { page: 'impactHighlights', text: 'Impact Highlights', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /> },
        { page: 'orgStructure', text: 'Org Structure', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z" /> },
        { page: 'projectHighlights', text: 'Project Highlights', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.157c.969 0 1.371 1.24.588 1.81l-3.364 2.446a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.538 1.118l-3.364-2.446a1 1 0 00-1.176 0l-3.364 2.446c-.783.57-1.838-.197-1.538-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.018 9.382c-.783-.57-.38-1.81.588-1.81h4.157a1 1 0 00.95-.69l1.286-3.955z" /> },
        { page: 'news', text: 'News & Updates', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
        { page: 'contact', text: 'Contact Information', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
        { page: 'footer', text: 'Footer Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      ],
    },
    { page: 'projects', text: 'Projects', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />, badge: { count: 24, color: 'bg-[#326101]' } },
    { page: 'tenders', text: 'Tenders', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, badge: { count: 8, color: 'bg-blue-500' } },
    { page: 'media', text: 'Media Gallery', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />, badge: { count: 156, color: 'bg-purple-500' } },
    { page: 'settings', text: 'Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  ];

  return (
    <>
      <aside
        className={`fixed left-0 top-16 h-full w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Navigation</h2>
              <button className="lg:hidden p-1 rounded hover:bg-gray-700" onClick={toggleSidebar}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.page}>
                  {item.submenu ? (
                    <>
                      <button
                        className={`nav-item w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-700 ${activePage === item.page ? 'active bg-gradient-to-br from-[#326101] to-[#639427]' : ''}`}
                        onClick={() => setIsWebSubmenuOpen(!isWebSubmenuOpen)}
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {item.icon}
                          </svg>
                          {item.text}
                        </div>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isWebSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <ul className={`submenu mt-1 ml-6 space-y-1 ${isWebSubmenuOpen ? 'open max-h-[500px]' : 'hidden max-h-0'}`}>
                        {item.submenu.map((subItem) => (
                          <li key={subItem.page}>
                            <a
                              href="#"
                              className={`nav-subitem flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 ${activePage === subItem.page ? 'active bg-gradient-to-br from-[#326101] to-[#639427]' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setActivePage(subItem.page);
                                if (window.innerWidth < 1024) toggleSidebar();
                              }}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {subItem.icon}
                              </svg>
                              {subItem.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a
                      href="#"
                      className={`nav-item flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${activePage === item.page ? 'active bg-gradient-to-br from-[#326101] to-[#639427]' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActivePage(item.page);
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                      {item.text}
                      {item.badge && (
                        <span className={`ml-auto ${item.badge.color} text-white text-xs px-2 py-1 rounded-full`}>
                          {item.badge.count}
                        </span>
                      )}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </aside>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden ${isOpen ? '' : 'hidden'}`} onClick={toggleSidebar}></div>
    </>
  );
};

const AdminPanel: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const getPageMeta = (page: string) => pageData[page] ?? pageData.dashboard;

  const updateBreadcrumb = (page: string) => {
    const isSubpage = ['header', 'hero', 'about','stats', 'information', 'geosites', 'sustainability', 'services', 'portfolio', 'impactHighlights', 'orgStructure', 'projectHighlights', 'news', 'contact', 'footer'].includes(page);
    const meta = getPageMeta(page);
    return (
      <div className="hidden md:flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {isSubpage && (
          <>
            <span>Web Management</span>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </>
        )}
        <span className="text-[#326101] font-medium">{meta.title}</span>
      </div>
    );
  };

  const PageComponent = pageComponents[activePage] || DashboardPage;

  return (
    <div className="bg-gray-50 min-h-screen">
      <style jsx global>{`
        .dropdown-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .dropdown-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.2s ease-out;
        }
        .notification-badge {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .admin-header {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .user-avatar {
          background: linear-gradient(135deg, #326101, #639427);
        }
        .mobile-menu-btn:hover {
          background: rgba(99, 148, 39, 0.1);
        }
        .nav-item {
          color: #d1d5db;
        }
        .nav-item:hover {
          background: #374151;
          color: white;
        }
        .nav-item.active {
          background: linear-gradient(135deg, #326101, #639427);
          color: white;
        }
        .nav-subitem:hover {
          background: #374151;
          color: white;
        }
        .submenu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .submenu.open {
          max-height: 1000px;
          overflow-y: auto;
          overflow-x: hidden;
        }
      `}</style>
      <header className="admin-header fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              className="mobile-menu-btn lg:hidden p-2 rounded-lg transition-colors duration-200"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Logo />
          </div>
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            {updateBreadcrumb(activePage)}

          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2">
              {[
                { title: 'Add New Project', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> },
                { title: 'Generate Report', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-2 text-gray-600 hover:text-[#326101] hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title={action.title}
                  onClick={() => console.log(`Quick action clicked: ${action.title}`)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {action.icon}
                  </svg>
                </button>
              ))}
            </div>
            <Notifications />
            <Profile />
          </div>
        </div>
      </header>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main className="pt-16 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageMeta(activePage).title}</h1>
              <p className="text-gray-600">{getPageMeta(activePage).description}</p>
            </div>
            <PageComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;








