'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

interface StrategicProject {
    name: string;
    details: string;
    content: string;
}

interface RoadmapItem {
    phase: string;
    title: string;
    description: string;
    status: string;
}

interface ProjectsForm {
    heroTitle: string;
    heroSubtitle: string;
    introTitle: string;
    introContent: string;
    strategicProjects: StrategicProject[];
    roadmap: RoadmapItem[];
    showUtilization: boolean;
}

const defaultData: ProjectsForm = {
    heroTitle: 'Direct Use Projects',
    heroSubtitle: 'Sustainable Geothermal Heat Applications',
    introTitle: 'Projects',
    introContent: 'In order to maximize geothermal resource utilization...',
    strategicProjects: [
        { name: 'Ngozi Direct-Use Hub', details: 'Mbeya Region • Medium-High Temp', content: 'Integrated applications...' }
    ],
    roadmap: [
        { phase: '1', title: 'Preliminary Studies', description: 'Desktop and field-based screening...', status: 'Completed' }
    ],
    showUtilization: true,
};

const ProjectsPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    const { control, register, handleSubmit, reset } = useForm<ProjectsForm>({
        defaultValues: defaultData,
    });

    const strategicProjectsArray = useFieldArray({ control, name: 'strategicProjects' });
    const roadmapArray = useFieldArray({ control, name: 'roadmap' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/projects-page');
                if (!res.ok) throw new Error('Failed to fetch projects page data');
                const data = await res.json();
                reset({
                    heroTitle: data.heroTitle || defaultData.heroTitle,
                    heroSubtitle: data.heroSubtitle || defaultData.heroSubtitle,
                    introTitle: data.introTitle || defaultData.introTitle,
                    introContent: data.introContent || defaultData.introContent,
                    strategicProjects: Array.isArray(data.strategicProjects) ? data.strategicProjects : defaultData.strategicProjects,
                    roadmap: Array.isArray(data.roadmap) ? data.roadmap : defaultData.roadmap,
                    showUtilization: typeof data.showUtilization === 'boolean' ? data.showUtilization : defaultData.showUtilization,
                });
            } catch (e: any) {
                console.error(e);
                setError(e?.message || 'Failed to load projects page data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [reset]);

    const onSubmit = async (values: ProjectsForm) => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/projects-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Failed to save projects content');
            const saved = await res.json();
            reset(saved);
            alert('Projects page content saved.');
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Direct Use Projects Management</h2>
                    <p className="text-sm text-gray-500 mb-6">Manage the content for the public /projects page.</p>
                    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                    {loading ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Page Settings */}
                            <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-900">Direct Use Sections</h3>
                                    <p className="text-sm text-emerald-700">Toggle visibility of specific sections on the public page.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-emerald-900">Show Utilization & Pilot Areas</label>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-[#326101]"
                                        {...register('showUtilization')}
                                    />
                                </div>
                            </div>

                            {/* Hero */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                                        <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('heroTitle')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                                        <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('heroSubtitle')} />
                                    </div>
                                </div>
                            </div>

                            {/* Intro */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Introduction</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('introTitle')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('introContent')} />
                                </div>
                            </div>

                            {/* Strategic Projects */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Strategic Projects</h3>
                                    <button type="button" onClick={() => strategicProjectsArray.append({ name: '', details: '', content: '' })} className="text-[#326101] hover:underline font-medium text-sm">+ Add Project</button>
                                </div>
                                <div className="space-y-4">
                                    {strategicProjectsArray.fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-white">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input placeholder="Project Name" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`strategicProjects.${index}.name` as const)} />
                                                <input placeholder="Details (e.g., Region • Temp)" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`strategicProjects.${index}.details` as const)} />
                                            </div>
                                            <textarea placeholder="Description Content" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`strategicProjects.${index}.content` as const)} />
                                            <div className="text-right">
                                                <button type="button" className="text-red-600 text-sm font-medium hover:underline" onClick={() => strategicProjectsArray.remove(index)}>Remove Project</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Roadmap */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Roadmap / Timeline</h3>
                                    <button type="button" onClick={() => roadmapArray.append({ phase: '', title: '', description: '', status: '' })} className="text-[#326101] hover:underline font-medium text-sm">+ Add Milestone</button>
                                </div>
                                <div className="space-y-4">
                                    {roadmapArray.fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-white">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <input placeholder="Phase/Serial (e.g., 1)" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`roadmap.${index}.phase` as const)} />
                                                <input placeholder="Milestone Title" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`roadmap.${index}.title` as const)} />
                                                <input placeholder="Status" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`roadmap.${index}.status` as const)} />
                                            </div>
                                            <textarea placeholder="Phase Description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`roadmap.${index}.description` as const)} />
                                            <div className="text-right">
                                                <button type="button" className="text-red-600 text-sm font-medium hover:underline" onClick={() => roadmapArray.remove(index)}>Remove Milestone</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#326101] text-white rounded-lg font-semibold hover:bg-[#2a5101] disabled:bg-gray-400 transition-colors shadow-md">
                                    {saving ? 'Saving...' : 'Save Projects Content'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;
