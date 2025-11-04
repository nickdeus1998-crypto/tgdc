'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

interface LinkItem {
  label: string;
  url: string;
}

interface SocialItem {
  name: string;
  url: string;
  icon?: string; // inline svg path
}

interface FooterForm {
  aboutText: string;
  address: string;
  email: string;
  phone: string;
  quickLinks: LinkItem[];
  socialLinks: SocialItem[];
  copyright: string;
}

const defaults: FooterForm = {
  aboutText: 'TGDC advances sustainable geothermal energy in Tanzania.',
  address: '',
  email: '',
  phone: '',
  quickLinks: [
    { label: 'About', url: '/about-us' },
    { label: 'Projects', url: '/projects' },
    { label: 'Contact', url: '/contact' },
  ],
  socialLinks: [
    { name: 'Twitter', url: '#', icon: '<path d="M8 19c11 0 17-9 17-17..." />' },
  ],
  copyright: `\u00A9 ${new Date().getFullYear()} TGDC. All rights reserved.`,
};

const FooterSettingsPage: React.FC = () => {
  const { control, register, handleSubmit, reset } = useForm<FooterForm>({ defaultValues: defaults });
  const quickLinksArray = useFieldArray({ control, name: 'quickLinks' });
  const socialLinksArray = useFieldArray({ control, name: 'socialLinks' });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/footer');
        if (!res.ok) throw new Error('Failed to fetch footer settings');
        const data = await res.json();
        reset({
          aboutText: data.aboutText ?? defaults.aboutText,
          address: data.address ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          quickLinks: Array.isArray(data.quickLinks) && data.quickLinks.length ? data.quickLinks : defaults.quickLinks,
          socialLinks: Array.isArray(data.socialLinks) && data.socialLinks.length ? data.socialLinks : defaults.socialLinks,
          copyright: data.copyright ?? defaults.copyright,
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to load footer settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (values: FooterForm) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save footer settings');
      const saved = await res.json();
      reset(saved);
      alert('Footer settings saved.');
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Footer Settings</h2>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Text</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('aboutText')} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('address')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('email')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('phone')} />
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                  <button type="button" onClick={() => quickLinksArray.append({ label: '', url: '' })} className="text-[#326101] hover:underline">Add Link</button>
                </div>
                <div className="space-y-3">
                  {quickLinksArray.fields.map((field, index) => (
                    <div key={field.id} className="grid md:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg">
                      <input placeholder="Label" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`quickLinks.${index}.label` as const)} />
                      <input placeholder="URL" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`quickLinks.${index}.url` as const)} />
                      <div className="md:col-span-2 text-right">
                        <button type="button" className="text-red-600" onClick={() => quickLinksArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                  <button type="button" onClick={() => socialLinksArray.append({ name: '', url: '', icon: '' })} className="text-[#326101] hover:underline">Add Social</button>
                </div>
                <div className="space-y-3">
                  {socialLinksArray.fields.map((field, index) => (
                    <div key={field.id} className="grid md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-lg">
                      <input placeholder="Name" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`socialLinks.${index}.name` as const)} />
                      <input placeholder="URL" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`socialLinks.${index}.url` as const)} />
                      <input placeholder="SVG path (inner)" className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register(`socialLinks.${index}.icon` as const)} />
                      <div className="md:col-span-3 text-right">
                        <button type="button" className="text-red-600" onClick={() => socialLinksArray.remove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Copyright</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('copyright')} />
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

export default FooterSettingsPage;

