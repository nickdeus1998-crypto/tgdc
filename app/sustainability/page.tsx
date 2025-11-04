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
        setOpenProjects(Object.fromEntries(mappedP.map((p) => [p.name, p.isOpen ?? false])))
      } catch (e) { /* ignore for view */ }
    })()
  }, [])

  const fundStakeholders = stakeholders.filter((s) => s.category === 'Fund support');
  const technicalStakeholders = stakeholders.filter((s) => s.category === 'Technical support');
  const capacityStakeholders = stakeholders.filter((s) => s.category === 'Capacity building');

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen box-border">
      {/* Hero */}
      <section className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            Sustainability
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Environment and Stakeholders
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
            A simple overview of our environmental approach and the partners supporting geothermal development in Tanzania.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTab('env')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === 'env' ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
              >
                Environment
              </button>
              <button
                onClick={() => setCurrentTab('stk')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${currentTab === 'stk' ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
              >
                Stakeholders
              </button>
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
                <h2 className="text-2xl font-bold text-gray-900">Environmental</h2>
                <p className="text-sm text-gray-500 mt-1">Geothermal Sector Strategic Environment and Social Assessment</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Overview</span>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              TGDC gratefully acknowledges the support received from TANESCO. Timely availability of right amount of funds is critical for project implementation.
              TGDC has continued pursuing grants/soft loans from development partners such as GRMF, SREP, ICEIDA, AfDB, and many more to assist in development of the geothermal energy in the country.
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

      {/* Stakeholders */}
      <section className={`${currentTab === 'stk' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Fund Support */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Stakeholders</h2>
                <p className="text-sm text-gray-500 mt-1">Fund support</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Funding</span>
            </div>
            <ul className="mt-4 grid md:grid-cols-2 gap-3">
              {fundStakeholders.map((stakeholder) => (
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
                        {new URL(stakeholder.url).host}
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
          {/* Technical Support */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Technical support</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Technical</span>
            </div>
            <ul className="mt-4 grid md:grid-cols-2 gap-3">
              {technicalStakeholders.map((stakeholder) => (
                <li
                  key={stakeholder.url}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 grid place-items-center font-bold">
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
                        {new URL(stakeholder.url).host}
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
          {/* Capacity Building */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Capacity building</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Capacity</span>
            </div>
            <ul className="mt-4 grid md:grid-cols-2 gap-3">
              {capacityStakeholders.map((stakeholder) => (
                <li
                  key={stakeholder.url}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 grid place-items-center font-bold">
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
                        {new URL(stakeholder.url).host}
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
