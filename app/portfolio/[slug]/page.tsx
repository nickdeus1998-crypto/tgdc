'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

interface ProjectResource {
    type: 'image' | 'video' | 'file';
    url: string;
    title?: string;
    description?: string;
}

interface ProjectImpact {
    jobs: string;
    co2: string;
    homes: string;
    investment: string;
}

interface ProjectTimelineEntry {
    phase: string;
    status: string;
    date: string;
}

interface Project {
    id: string;
    title: string;
    location: string;
    capacity: string;
    investment: string;
    status: string;
    category: string;
    progress: number;
    description: string;
    keyFeatures: string[];
    timeline: ProjectTimelineEntry[];
    impact: ProjectImpact;
    resources: ProjectResource[];
    imageUrl?: string | null;
}

const ProjectDetailPage = () => {
    const { slug } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Project not found');
                    throw new Error('Failed to load project details');
                }
                setProject(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#326101] border-t-transparent" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{error || 'Project not found'}</h2>
                <Link href="/" className="text-[#326101] hover:underline text-sm">Return to Home</Link>
            </div>
        );
    }

    const statusColor = (s: string) => {
        const l = s.toLowerCase();
        if (l.includes('operational')) return 'bg-green-50 text-green-700';
        if (l.includes('construction')) return 'bg-amber-50 text-amber-700';
        if (l.includes('development')) return 'bg-purple-50 text-purple-700';
        return 'bg-blue-50 text-blue-700';
    };

    const hasImpact = project.impact && (project.impact.jobs || project.impact.co2 || project.impact.homes || project.impact.investment);
    const hasTimeline = project.timeline && project.timeline.length > 0;
    const hasFeatures = project.keyFeatures && project.keyFeatures.length > 0;
    const hasResources = project.resources && project.resources.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>{project.title} | TGDC Portfolio</title>
            </Head>

            {/* Hero */}
            <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.imageUrl || '/geothermal.jpg'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
                        <Link
                            href="/"
                            className="inline-flex items-center text-white/70 hover:text-white text-sm mb-5 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Portfolio
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(project.status)}`}>
                                {project.status}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                            {project.title}
                        </h1>
                        <p className="text-white/70 flex items-center gap-1.5 text-base">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {project.location}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                        {[
                            { label: 'Capacity', value: project.capacity },
                            { label: 'Investment', value: project.investment },
                            { label: 'Status', value: project.status },
                            { label: 'Progress', value: project.progress ? `${project.progress}%` : '' },
                        ].map((stat) => (
                            <div key={stat.label} className="py-5 px-4 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{stat.label}</div>
                                <div className="text-lg font-semibold text-gray-900">{stat.value || '—'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        <section className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Project</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {project.description}
                            </p>
                        </section>

                        {/* Key Features */}
                        {hasFeatures && (
                            <section className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h2>
                                <ul className="space-y-3">
                                    {project.keyFeatures.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-[#326101] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Resources */}
                        {hasResources && (
                            <section className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {project.resources.map((res, idx) => (
                                        <div key={idx} className="rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                                            {res.type === 'image' && (
                                                <div className="aspect-video overflow-hidden">
                                                    <img src={res.url} alt={res.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {res.type === 'video' && (
                                                <a href={res.url} target="_blank" rel="noopener noreferrer"
                                                    className="aspect-video bg-gray-900 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </a>
                                            )}
                                            <div className="p-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-1">{res.title || 'Resource'}</h4>
                                                {res.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">{res.description}</p>
                                                )}
                                                {res.type === 'file' && (
                                                    <a href={res.url} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 mt-2 text-xs text-[#326101] hover:underline">
                                                        Download
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">

                        {/* Progress Ring */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-5">Progress</h3>
                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="56" cy="56" r="50" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                                    <circle cx="56" cy="56" r="50" stroke="#326101" strokeWidth="6" fill="transparent"
                                        strokeDasharray={314} strokeDashoffset={314 - (314 * project.progress) / 100}
                                        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900">{project.progress ? `${project.progress}%` : '—'}</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t border-gray-50 pt-4">
                                <div className="flex justify-between py-1.5">
                                    <span className="text-gray-400">Status</span>
                                    <span className="text-gray-700">{project.status}</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-gray-400">Category</span>
                                    <span className="text-gray-700 capitalize">{project.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Impact */}
                        {hasImpact && (
                            <div className="bg-gray-900 rounded-xl p-6 text-white">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Expected Impact</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {project.impact.jobs && (
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-xl font-semibold text-emerald-400">{project.impact.jobs}</div>
                                            <div className="text-xs text-gray-400 mt-1">Jobs Created</div>
                                        </div>
                                    )}
                                    {project.impact.co2 && (
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-xl font-semibold text-sky-400">{project.impact.co2}</div>
                                            <div className="text-xs text-gray-400 mt-1">CO₂ Savings</div>
                                        </div>
                                    )}
                                    {project.impact.homes && (
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-xl font-semibold text-purple-400">{project.impact.homes}</div>
                                            <div className="text-xs text-gray-400 mt-1">Homes Powered</div>
                                        </div>
                                    )}
                                    {project.impact.investment && (
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-xl font-semibold text-amber-400">{project.impact.investment}</div>
                                            <div className="text-xs text-gray-400 mt-1">Investment</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        {hasTimeline && (
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-5">Roadmap</h3>
                                <div className="relative space-y-5 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                                    {project.timeline.map((item, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${item.status === 'Completed' ? 'bg-[#326101]' :
                                                item.status === 'In Progress' ? 'bg-amber-400' : 'bg-gray-300'
                                                }`} />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.phase}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400">{item.date}</span>
                                                    <span className="text-xs text-gray-400">·</span>
                                                    <span className={`text-xs ${item.status === 'Completed' ? 'text-[#326101]' :
                                                        item.status === 'In Progress' ? 'text-amber-600' : 'text-gray-400'
                                                        }`}>{item.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectDetailPage;
