'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  name: string;
  status: string;
  location: string;
  description: string;
  badgeColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  isOpen?: boolean;
}

interface Stakeholder {
  name: string;
  url: string;
  initial: string;
  category: string;
  badgeColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
}

// Loaded from API
const projectsSeed: Project[] = [];

const stakeholdersSeed: Stakeholder[] = [];

const Details: React.FC<{
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ project, isOpen, onToggle }) => {
  return (
    <div className="py-4">
      <div
        className="flex items-start justify-between cursor-pointer select-none"
        onClick={onToggle}
      >
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{project.name}</h4>
            <span
              className={`text-[11px] px-2 py-1 rounded-full ${project.badgeColor} ${project.badgeTextColor} border ${project.badgeBorderColor}`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{project.location}</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && <div className="mt-3 text-gray-700">{project.description}</div>}
    </div>
  );
};

const Sustainability: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('env');
  const [projects, setProjects] = useState<Project[]>(projectsSeed);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(stakeholdersSeed);
  const [openProjects, setOpenProjects] = useState<{ [key: string]: boolean }>({});
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [tabContent, setTabContentData] = useState<{
    envTitle: string; envHeading: string; envSubheading: string; envContent: string;
    socialTitle: string;
    safetyTitle: string; safetyHeading: string; safetySubheading: string; safetyIntro: string;
    safetyItems: { title: string; description: string }[];
  }>({
    envTitle: 'Environment', envHeading: 'Environmental', envSubheading: '', envContent: '',
    socialTitle: 'Social',
    safetyTitle: 'Safety and Health', safetyHeading: 'Safety and Health', safetySubheading: '', safetyIntro: '',
    safetyItems: [],
  });

  const showToast = (message: string = 'Link copied to clipboard') => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  };

  const toggleProject = (name: string) => {
    setOpenProjects((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    (async () => {
      try {
        const [prjRes, stRes] = await Promise.all([
          fetch('/api/sustainability/projects'),
          fetch('/api/sustainability/partners'),
        ])
        const [prj, st] = await Promise.all([
          prjRes.ok ? prjRes.json() : Promise.resolve([]),
          stRes.ok ? stRes.json() : Promise.resolve([]),
        ])
        const mappedP: Project[] = (prj || []).map((p: any) => ({
          name: p.name,
          status: p.status,
          location: p.location,
          description: p.description,
          badgeColor: p.badgeColor,
          badgeTextColor: p.badgeTextColor,
          badgeBorderColor: p.badgeBorderColor,
          isOpen: !!p.isOpen,
        }))
        const mappedS: Stakeholder[] = (st || []).map((s: any) => ({
          name: s.name,
          url: s.url,
          initial: s.initial,
          category: s.category,
          badgeColor: s.badgeColor,
          badgeTextColor: s.badgeTextColor,
          badgeBorderColor: s.badgeBorderColor,
        }))
        setProjects(mappedP)
        setStakeholders(mappedS)
        // Fetch tab content
        try {
          const tcRes = await fetch('/api/sustainability/content');
          if (tcRes.ok) {
            const tc = await tcRes.json();
            setTabContentData({
              envTitle: tc.envTitle || 'Environment',
              envHeading: tc.envHeading || 'Environmental',
              envSubheading: tc.envSubheading || '',
              envContent: tc.envContent || tc.envIntro || '',
              socialTitle: tc.socialTitle || 'Social',
              safetyTitle: tc.safetyTitle || 'Safety and Health',
              safetyHeading: tc.safetyHeading || 'Safety and Health',
              safetySubheading: tc.safetySubheading || '',
              safetyIntro: tc.safetyIntro || '',
              safetyItems: Array.isArray(tc.safetyItems) ? tc.safetyItems : [],
            });
          }
        } catch { }
        setOpenProjects(Object.fromEntries(mappedP.map((p) => [p.name, p.isOpen ?? false])))
      } catch (e) { /* ignore for view */ }
    })()
  }, [])

  // Group stakeholders by category dynamically
  const groupedByCategory = stakeholders.reduce<Record<string, typeof stakeholders>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen box-border">

      {/* Tabs */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTab('env')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === 'env' ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
              >{tabContent.envTitle}</button>
              <button
                onClick={() => setCurrentTab('stk')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === 'stk' ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
              >{tabContent.socialTitle}</button>
              <button
                onClick={() => setCurrentTab('safety')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === 'safety' ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
              >{tabContent.safetyTitle}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Environment */}
      <section className={`${currentTab === 'env' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Strategic Assessment */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{tabContent.envHeading}</h2>
                {tabContent.envSubheading && <p className="text-sm text-gray-500 mt-1">{tabContent.envSubheading}</p>}
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Overview</span>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              {tabContent.envContent}
            </p>
          </div>
          {/* ESIA by Project */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Project Environmental and Social Impact Assessment</h3>
                <p className="text-sm text-gray-500 mt-1">Status across active projects</p>
              </div>
            </div>
            <div className="mt-4 divide-y divide-gray-100">
              {projects.map((project) => (
                <Details
                  key={project.name}
                  project={project}
                  isOpen={openProjects[project.name]}
                  onToggle={() => toggleProject(project.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social / Stakeholders */}
      <section className={`${currentTab === 'stk' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {Object.entries(groupedByCategory).map(([category, members]) => (
            <div key={category} className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {members.map((stakeholder) => (
                  <li
                    key={stakeholder.url}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center font-bold">
                        {stakeholder.initial}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{stakeholder.name}</div>
                        <Link
                          href={stakeholder.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                          style={{ color: '#326101' }}
                        >
                          {(() => { try { return new URL(stakeholder.url).host; } catch { return stakeholder.url; } })()}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(stakeholder.url);
                          showToast();
                        } catch {
                          showToast('Copy failed. Please copy manually.');
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Safety and Health */}
      <section className={`${currentTab === 'safety' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">{tabContent.safetyHeading}</h2>
            {tabContent.safetySubheading && <p className="text-sm text-gray-500 mt-1">{tabContent.safetySubheading}</p>}
            {tabContent.safetyIntro && (
              <p className="text-gray-700 leading-relaxed mt-4">{tabContent.safetyIntro}</p>
            )}
          </div>
          {tabContent.safetyItems.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {tabContent.safetyItems.filter(i => i.title).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Toast */}
      {toast.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg animate-[fade_0.25s_ease_both]">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Sustainability;
