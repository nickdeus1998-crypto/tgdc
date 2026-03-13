'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
    id: number;
    title: string;
    location: string;
    capacity: string;
    status: string;
    category: string;
    description: string;
    imageUrl?: string | null;
}

export function PortfolioProjectsSection() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [sectionTitle, setSectionTitle] = useState('Our Projects');
    const [sectionSubtitle, setSectionSubtitle] = useState('Explore our portfolio of geothermal energy projects across Tanzania.');

    useEffect(() => {
        fetch('/api/projects?limit=100')
            .then(r => r.ok ? r.json() : { items: [] })
            .then(data => {
                const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
                setProjects(items);
            })
            .catch(() => { })
            .finally(() => setLoading(false));

        // Fetch editable section titles
        fetch('/api/site-settings?key=projects_section_title')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.value) setSectionTitle(data.value); })
            .catch(() => { });
        fetch('/api/site-settings?key=projects_section_subtitle')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.value) setSectionSubtitle(data.value); })
            .catch(() => { });
    }, []);

    const getStatusLabel = (s: string) => {
        const l = s.toLowerCase();
        if (l.includes('operational')) return 'Operational';
        if (l.includes('construction')) return 'Construction';
        if (l.includes('development')) return 'Development';
        if (l.includes('exploration')) return 'Exploration';
        return s;
    };

    const getStatusColor = (s: string) => {
        const l = s.toLowerCase();
        if (l.includes('operational')) return 'bg-green-100 text-green-700';
        if (l.includes('construction')) return 'bg-amber-100 text-amber-700';
        if (l.includes('development')) return 'bg-purple-100 text-purple-700';
        return 'bg-blue-100 text-blue-700';
    };

    if (loading) {
        return (
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500">Loading projects…</p>
                </div>
            </section>
        );
    }

    if (!projects.length) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                        {sectionTitle}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {sectionSubtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${project.imageUrl || '/geothermal.jpg'})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                                            {getStatusLabel(project.status)}
                                        </span>
                                        {project.capacity && (
                                            <span className="text-emerald-200 text-lg font-bold">{project.capacity}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                    <p className="text-emerald-100 text-sm mt-1">{project.location}</p>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-gray-600 text-sm line-clamp-3 flex-1">{project.description}</p>
                                <Link
                                    href={`/portfolio/${project.id}`}
                                    className="mt-4 block w-full bg-[#326101] text-white py-2.5 rounded-lg font-semibold hover:bg-[#639427] transition-colors text-center text-sm"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
