'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

interface TimelineItem {
  year: string;
  title: string;
  timeAgo: string;
  description: string;
}

interface BackgroundItem {
  title: string;
  description: string;
}

interface MissionVisionItem {
  title: string;
  description: string;
  points: string[];
  icon: string;
  gradient: string;
}

interface CoreValueItem {
  title: string;
  description: string;
  icon: string;
}

interface AboutForm {
  heroTitle: string;
  heroSubtitle: string;
  timeline: TimelineItem[];
  background: BackgroundItem[];
  missionVision: MissionVisionItem[];
  coreValues: CoreValueItem[];
  stats: { label: string; target: number }[];
}

const defaultData: AboutForm = {
  heroTitle: 'About TGDC',
  heroSubtitle: "Leading Tanzania's sustainable energy future through innovative geothermal development",
  timeline: [
    { year: '2008', title: 'Foundation', timeAgo: '15 years ago', description: 'TGDC established under TANESCO to spearhead geothermal development.' },
    { year: '2012', title: 'First Exploration', timeAgo: '11 years ago', description: 'Comprehensive exploration in the Rift Valley begins.' },
  ],
  background: [
    { title: 'Government Initiative', description: "Established to support energy security and economic development." },
  ],
  missionVision: [
    {
      title: 'Our Mission',
      description: 'Develop Tanzania\'s geothermal resources sustainably and responsibly.',
      points: ['Sustainable energy development', 'Environmental stewardship', 'Community empowerment', 'Technical excellence'],
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />',
      gradient: 'from-[#326101] to-[#639427]'
    },
    {
      title: 'Our Vision',
      description: 'Be the leading geothermal energy developer in East Africa.',
      points: ['Regional leadership in geothermal', 'Innovation and technology advancement', 'Climate change mitigation', 'Sustainable development goals'],
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />',
      gradient: 'from-[#639427] to-[#8BC34A]'
    }
  ],
  coreValues: [
    { title: 'Integrity', description: 'Highest ethical standards and transparency.', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />' },
  ],
  stats: [
    { label: 'Years of Experience', target: 15 },
    { label: 'Active Projects', target: 8 },
  ],
};

const AboutUsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const { control, register, handleSubmit, reset, watch } = useForm<AboutForm>({
    defaultValues: defaultData,
  });

  // Field arrays
  const timelineArray = useFieldArray({ control, name: 'timeline' });
  const backgroundArray = useFieldArray({ control, name: 'background' });
  const missionVisionArray = useFieldArray({ control, name: 'missionVision' });
  const coreValuesArray = useFieldArray({ control, name: 'coreValues' });
  const statsArray = useFieldArray({ control, name: 'stats' });

  // Fetch existing
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/about');
        if (!res.ok) throw new Error('Failed to fetch About data');
        const data = await res.json();
        // Normalize empty arrays
        reset({
          heroTitle: data.heroTitle || defaultData.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultData.heroSubtitle,
          timeline: Array.isArray(data.timeline) ? data.timeline : defaultData.timeline,
          background: Array.isArray(data.background) ? data.background : defaultData.background,
          missionVision: Array.isArray(data.missionVision) ? data.missionVision : defaultData.missionVision,
          coreValues: Array.isArray(data.coreValues) ? data.coreValues : defaultData.coreValues,
          stats: Array.isArray(data.stats) ? data.stats : defaultData.stats,
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to load About data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (values: AboutForm) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save About content');
      const saved = await res.json();
      reset(saved);
      alert('About Us content saved.');
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">About Us Content</h2>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Hero text */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hero</h3>
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

              {/* Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                  <button type="button" onClick={() => timelineArray.append({ year: '', title: '', timeAgo: '', description: '' })} className="text-[#326101] hover:underline">Add Item</button>
                </div>
                <div className="space-y-4">
                  {timelineArray.fields.map((field, index) => (
                    <div key={field.id} className="grid md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
                      <input placeholder="Year" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`timeline.${index}.year` as const)} />
                      <input placeholder="Title" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`timeline.${index}.title` as const)} />
                      <input placeholder="Time Ago" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`timeline.${index}.timeAgo` as const)} />
                      <div className="md:col-span-4">
                        <textarea placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`timeline.${index}.description` as const)} />
                      </div>
                      <div className="md:col-span-4 text-right">
                        <button type="button" className="text-red-600" onClick={() => timelineArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Background</h3>
                  <button type="button" onClick={() => backgroundArray.append({ title: '', description: '' })} className="text-[#326101] hover:underline">Add Item</button>
                </div>
                <div className="space-y-4">
                  {backgroundArray.fields.map((field, index) => (
                    <div key={field.id} className="grid md:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg">
                      <input placeholder="Title" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`background.${index}.title` as const)} />
                      <textarea placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 md:col-span-2" {...register(`background.${index}.description` as const)} />
                      <div className="md:col-span-2 text-right">
                        <button type="button" className="text-red-600" onClick={() => backgroundArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission & Vision */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Mission & Vision</h3>
                  <button type="button" onClick={() => missionVisionArray.append({ title: '', description: '', points: [], icon: '', gradient: '' })} className="text-[#326101] hover:underline">Add Item</button>
                </div>
                <div className="space-y-4">
                  {missionVisionArray.fields.map((field, index) => (
                    <div key={field.id} className="p-3 border border-gray-200 rounded-lg space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input placeholder="Title" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`missionVision.${index}.title` as const)} />
                        <input placeholder="Gradient (e.g., from-[#326101] to-[#639427])" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`missionVision.${index}.gradient` as const)} />
                      </div>
                      <textarea placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`missionVision.${index}.description` as const)} />
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Points (one per line)</label>
                        <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
                          defaultValue={(watch(`missionVision.${index}.points`) || []).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                            // react-hook-form manual update via hidden input binding
                            const hidden = document.getElementById(`points-${index}`) as HTMLInputElement | null;
                            if (hidden) hidden.value = JSON.stringify(lines);
                          }}
                        />
                        {/* Hidden input to persist points as array */}
                        <input id={`points-${index}`} type="hidden" {...register(`missionVision.${index}.points` as const, {
                          setValueAs: (v) => {
                            if (Array.isArray(v)) return v;
                            try { return JSON.parse(v || '[]'); } catch { return []; }
                          },
                        })} />
                      </div>
                      <input placeholder="SVG Path (inner)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`missionVision.${index}.icon` as const)} />
                      <div className="text-right">
                        <button type="button" className="text-red-600" onClick={() => missionVisionArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Values */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Core Values</h3>
                  <button type="button" onClick={() => coreValuesArray.append({ title: '', description: '', icon: '' })} className="text-[#326101] hover:underline">Add Item</button>
                </div>
                <div className="space-y-4">
                  {coreValuesArray.fields.map((field, index) => (
                    <div key={field.id} className="p-3 border border-gray-200 rounded-lg space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input placeholder="Title" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`coreValues.${index}.title` as const)} />
                        <input placeholder="SVG Path (inner)" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`coreValues.${index}.icon` as const)} />
                      </div>
                      <textarea placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`coreValues.${index}.description` as const)} />
                      <div className="text-right">
                        <button type="button" className="text-red-600" onClick={() => coreValuesArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats (optional for About page) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Stats (optional)</h3>
                  <button type="button" onClick={() => statsArray.append({ label: '', target: 0 })} className="text-[#326101] hover:underline">Add Stat</button>
                </div>
                <div className="space-y-3">
                  {statsArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input placeholder="Label" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`stats.${index}.label` as const)} />
                      <input type="number" placeholder="Target" className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`stats.${index}.target` as const, { valueAsNumber: true })} />
                      <button type="button" className="text-red-600" onClick={() => statsArray.remove(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;

