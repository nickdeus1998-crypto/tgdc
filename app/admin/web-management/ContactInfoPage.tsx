'use client';

import React, { useState, useEffect } from 'react';

const CONTACT_KEYS = [
  { key: 'contact_address_line1', label: 'Address Line 1', placeholder: 'e.g., TGDC Headquarters' },
  { key: 'contact_address_line2', label: 'Address Line 2', placeholder: 'e.g., Dar es Salaam, Tanzania' },
  { key: 'contact_phone', label: 'Phone Number', placeholder: 'e.g., +255 22 266 3813' },
  { key: 'contact_email', label: 'Email Address', placeholder: 'e.g., info@tgdc.go.tz' },
  { key: 'contact_working_hours', label: 'Working Hours', placeholder: 'e.g., Monday – Friday: 8:00 AM – 5:00 PM' },
  { key: 'contact_working_hours_note', label: 'Working Hours Note', placeholder: 'e.g., Closed on weekends and public holidays' },
  { key: 'contact_map_title', label: 'Map Section Title', placeholder: 'e.g., Our Location' },
  { key: 'contact_map_subtitle', label: 'Map Subtitle', placeholder: 'e.g., TGDC Office — Dar es Salaam, Tanzania' },
  { key: 'contact_map_embed_url', label: 'Google Maps Embed URL', placeholder: 'https://www.google.com/maps/embed?pb=...' },
  { key: 'contact_hero_title', label: 'Hero Title', placeholder: 'e.g., Get in Touch' },
  { key: 'contact_hero_subtitle', label: 'Hero Subtitle', placeholder: 'e.g., Have a question or inquiry?...' },
];

export default function ContactInfoPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/site-settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const rows: { key: string; value: string }[] = await res.json();
        const map: Record<string, string> = {};
        for (const r of rows) {
          if (r.key.startsWith('contact_')) map[r.key] = r.value;
        }
        setValues(map);
      } catch (e: any) {
        setStatus({ type: 'error', message: e?.message || 'Failed to load' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      for (const { key } of CONTACT_KEYS) {
        await fetch('/api/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: values[key] || '' }),
        });
      }
      setStatus({ type: 'success', message: 'Contact information saved successfully!' });
    } catch {
      setStatus({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading contact settings...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
          <p className="text-sm text-gray-500 mb-6">Manage the content displayed on the public contact page.</p>

          {status && (
            <div className={`mb-6 p-3 rounded-lg text-sm border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {status.message}
            </div>
          )}

          <div className="space-y-8">
            {/* Hero Section */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#326101]"></span>
                Hero Section
              </legend>
              <div className="space-y-4 pl-4">
                {CONTACT_KEYS.filter(k => k.key.includes('hero')).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={values[key] || ''}
                      onChange={e => setValues({ ...values, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Contact Details */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#326101]"></span>
                Contact Details
              </legend>
              <div className="space-y-4 pl-4">
                {CONTACT_KEYS.filter(k => ['contact_address_line1', 'contact_address_line2', 'contact_phone', 'contact_email', 'contact_working_hours', 'contact_working_hours_note'].includes(k.key)).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={values[key] || ''}
                      onChange={e => setValues({ ...values, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Map Settings */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#326101]"></span>
                Map Settings
              </legend>
              <div className="space-y-4 pl-4">
                {CONTACT_KEYS.filter(k => k.key.includes('map')).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    {key === 'contact_map_embed_url' ? (
                      <textarea
                        value={values[key] || ''}
                        onChange={e => setValues({ ...values, [key]: e.target.value })}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[key] || ''}
                        onChange={e => setValues({ ...values, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900"
                      />
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#326101] hover:bg-[#2a5200] text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Contact Info'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
