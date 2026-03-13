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
  relatedLinks: LinkItem[];
  staffMailLinks: LinkItem[];
  bottomNavLinks: LinkItem[];
  copyright: string;
  designedByText: string;
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
  relatedLinks: [
    { label: 'TANESCO', url: 'https://www.tanesco.co.tz' },
    { label: 'EWURA', url: 'https://www.ewura.go.tz' },
    { label: 'DIT', url: 'https://www.dit.ac.tz' },
    { label: 'UDOM', url: 'https://www.udom.ac.tz' },
    { label: 'GST', url: '#' },
  ],
  staffMailLinks: [
    { label: 'TGDC Mail', url: 'https://mail.tgdc.go.tz' },
    { label: 'TANESCO Mail', url: 'https://mail.tanesco.go.tz' },
  ],
  bottomNavLinks: [
    { label: 'Sitemap', url: '/sitemap-page' },
    { label: 'Privacy Policy', url: '/privacy-policy' },
    { label: 'Terms and Conditions', url: '/terms' },
    { label: 'Copyright Statement', url: '/copyright' },
  ],
  copyright: `\u00A9 ${new Date().getFullYear()} TGDC. All rights reserved.`,
  designedByText: 'The website is Designed, Developed And Maintained by TGDC. Content Maintained by TGDC.',
};

function LinkArraySection({
  title,
  fields,
  register,
  append,
  remove,
  namePrefix,
}: {
  title: string;
  fields: { id: string }[];
  register: any;
  append: (val: LinkItem) => void;
  remove: (i: number) => void;
  namePrefix: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button type="button" onClick={() => append({ label: '', url: '' })} className="text-sm text-[#326101] hover:underline">
          + Add Link
        </button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-gray-300 text-xs font-bold w-5 text-center">{index + 1}</span>
            <input
              placeholder="Label"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm"
              {...register(`${namePrefix}.${index}.label` as const)}
            />
            <input
              placeholder="URL"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm"
              {...register(`${namePrefix}.${index}.url` as const)}
            />
            <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(index)}>
              ✕
            </button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-sm text-gray-400 italic">No links added yet.</p>}
      </div>
    </div>
  );
}

const FooterSettingsPage: React.FC = () => {
  const { control, register, handleSubmit, reset } = useForm<FooterForm>({ defaultValues: defaults });
  const quickLinksArray = useFieldArray({ control, name: 'quickLinks' });
  const socialLinksArray = useFieldArray({ control, name: 'socialLinks' });
  const relatedLinksArray = useFieldArray({ control, name: 'relatedLinks' });
  const staffMailLinksArray = useFieldArray({ control, name: 'staffMailLinks' });
  const bottomNavLinksArray = useFieldArray({ control, name: 'bottomNavLinks' });

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
          relatedLinks: Array.isArray(data.relatedLinks) && data.relatedLinks.length ? data.relatedLinks : defaults.relatedLinks,
          staffMailLinks: Array.isArray(data.staffMailLinks) && data.staffMailLinks.length ? data.staffMailLinks : defaults.staffMailLinks,
          bottomNavLinks: Array.isArray(data.bottomNavLinks) && data.bottomNavLinks.length ? data.bottomNavLinks : defaults.bottomNavLinks,
          copyright: data.copyright ?? defaults.copyright,
          designedByText: data.designedByText ?? defaults.designedByText,
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
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <input type="hidden" {...register('aboutText')} />

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

              <hr className="border-gray-200" />

              {/* Quick Links */}
              <LinkArraySection
                title="Quick Links"
                fields={quickLinksArray.fields}
                register={register}
                append={quickLinksArray.append}
                remove={quickLinksArray.remove}
                namePrefix="quickLinks"
              />

              <hr className="border-gray-200" />

              {/* Related Links */}
              <LinkArraySection
                title="Related Links"
                fields={relatedLinksArray.fields}
                register={register}
                append={relatedLinksArray.append}
                remove={relatedLinksArray.remove}
                namePrefix="relatedLinks"
              />

              <hr className="border-gray-200" />

              {/* Staff Mail Links */}
              <LinkArraySection
                title="Staff Mail Links"
                fields={staffMailLinksArray.fields}
                register={register}
                append={staffMailLinksArray.append}
                remove={staffMailLinksArray.remove}
                namePrefix="staffMailLinks"
              />

              <hr className="border-gray-200" />

              {/* Bottom Nav Links */}
              <LinkArraySection
                title="Bottom Navigation Links"
                fields={bottomNavLinksArray.fields}
                register={register}
                append={bottomNavLinksArray.append}
                remove={bottomNavLinksArray.remove}
                namePrefix="bottomNavLinks"
              />

              <hr className="border-gray-200" />

              {/* Social Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                  <button type="button" onClick={() => socialLinksArray.append({ name: '', url: '', icon: '' })} className="text-sm text-[#326101] hover:underline">
                    + Add Social
                  </button>
                </div>
                <div className="space-y-2">
                  {socialLinksArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-gray-300 text-xs font-bold w-5 text-center">{index + 1}</span>
                      <input placeholder="Name" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm" {...register(`socialLinks.${index}.name` as const)} />
                      <input placeholder="URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm" {...register(`socialLinks.${index}.url` as const)} />
                      <input placeholder="SVG path" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm" {...register(`socialLinks.${index}.icon` as const)} />
                      <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => socialLinksArray.remove(index)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Copyright</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('copyright')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designed By Text</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" {...register('designedByText')} />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400 font-medium">
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
