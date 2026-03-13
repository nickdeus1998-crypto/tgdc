'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import IconPicker from '../components/IconPicker';

interface Feature {
  text: string;
}

interface Service {
  icon: string;
  title: string;
  content: string;
  features: Feature[];
}

interface ServicesSectionData {
  headerOne: string;
  headerTwo: string;
  subheader?: string;
  mandate?: string;
  mandateTitle?: string;
  mandateVisibleOnHomepage?: boolean;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  services: Service[];
}

const ServicesSectionPage: React.FC = () => {
  const { control, register, handleSubmit, setValue, formState: { errors }, reset } = useForm<ServicesSectionData>({
    defaultValues: {
      headerOne: '',
      headerTwo: '',
      subheader: '',
      mandate: '',
      mandateTitle: '',
      mandateVisibleOnHomepage: false,
      ctaTitle: '',
      ctaSubtitle: '',
      ctaPrimaryLabel: '',
      ctaPrimaryHref: '',
      ctaSecondaryLabel: '',
      ctaSecondaryHref: '',
      services: [{ icon: '', title: '', content: '', features: [{ text: '' }] }]
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray<ServicesSectionData, 'services'>({
    control,
    name: 'services',
  });

  // Watch all services so features re-render correctly
  const watchedServices = useWatch({ control, name: 'services' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: ServicesSectionData = await response.json();
        reset({
          headerOne: data.headerOne || '',
          headerTwo: data.headerTwo || '',
          subheader: data.subheader || '',
          mandate: data.mandate || '',
          mandateTitle: data.mandateTitle || '',
          mandateVisibleOnHomepage: data.mandateVisibleOnHomepage ?? false,
          ctaTitle: data.ctaTitle || '',
          ctaSubtitle: data.ctaSubtitle || '',
          ctaPrimaryLabel: data.ctaPrimaryLabel || '',
          ctaPrimaryHref: data.ctaPrimaryHref || '',
          ctaSecondaryLabel: data.ctaSecondaryLabel || '',
          ctaSecondaryHref: data.ctaSecondaryHref || '',
          services: data.services.length > 0
            ? data.services.map(s => ({
              ...s,
              features: Array.isArray(s.features)
                ? (s.features as unknown as string[]).map((f: string) => ({ text: f }))
                : [{ text: '' }]
            }))
            : [{ icon: '', title: '', content: '', features: [{ text: '' }] }]
        });
      } catch (err) {
        console.error('Error fetching services data:', err);
        setError('Failed to load services data.');
      }
    };
    fetchServicesData();
  }, [reset]);

  const onSubmit = async (data: ServicesSectionData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          services: data.services.map(s => ({
            ...s,
            features: s.features.filter(f => f.text.trim()).map(f => f.text.trim()) // Clean features array
          }))
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedData: ServicesSectionData = await response.json();
      reset({
        headerOne: updatedData.headerOne || '',
        headerTwo: updatedData.headerTwo || '',
        subheader: updatedData.subheader || '',
        mandate: updatedData.mandate || '',
        mandateTitle: updatedData.mandateTitle || '',
        mandateVisibleOnHomepage: updatedData.mandateVisibleOnHomepage ?? false,
        ctaTitle: updatedData.ctaTitle || '',
        ctaSubtitle: updatedData.ctaSubtitle || '',
        ctaPrimaryLabel: updatedData.ctaPrimaryLabel || '',
        ctaPrimaryHref: updatedData.ctaPrimaryHref || '',
        ctaSecondaryLabel: updatedData.ctaSecondaryLabel || '',
        ctaSecondaryHref: updatedData.ctaSecondaryHref || '',
        services: updatedData.services.length > 0
          ? updatedData.services.map(s => ({
            ...s,
            features: Array.isArray(s.features)
              ? (s.features as unknown as string[]).map((f: string) => ({ text: f }))
              : [{ text: '' }]
          }))
          : [{ icon: '', title: '', content: '', features: [{ text: '' }] }]
      });
      alert('Services section updated successfully!');
    } catch (err) {
      setError('Failed to update services section.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Services Section Management</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ─── Mandate ─── */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-bold text-gray-800 mb-3">TGDC Mandate</label>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Mandate Heading</label>
                <input
                  {...register('mandateTitle')}
                  placeholder="e.g., Our Mandate"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                />
              </div>
              <textarea
                id="mandate"
                {...register('mandate')}
                rows={4}
                placeholder="TGDC is the sole government entity dedicated to..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-400">This text appears on the services page above the service cards.</p>
              <div className="flex items-center gap-2 mt-3">
                <input
                  id="mandateVisibleOnHomepage"
                  type="checkbox"
                  {...register('mandateVisibleOnHomepage')}
                  className="w-4 h-4 text-[#326101] border-gray-300 rounded"
                />
                <label htmlFor="mandateVisibleOnHomepage" className="text-sm text-gray-700">Show mandate on homepage</label>
              </div>
            </div>

            {/* ─── Section Headers ─── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Headers</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <input
                    {...register('headerOne', { required: 'Header One is required' })}
                    placeholder="Header One (e.g., Comprehensive)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                  />
                  {errors.headerOne && (
                    <p className="mt-1 text-sm text-red-500">{errors.headerOne.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('headerTwo')}
                    placeholder="Header Two - optional (e.g., Geothermal Services)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="subheader" className="block text-sm font-medium text-gray-700 mb-2">Subheader</label>
                <textarea
                  id="subheader"
                  {...register('subheader')}
                  rows={3}
                  placeholder="Section description (e.g., From initial site assessment...)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              {serviceFields.map((serviceField, serviceIndex) => (
                <div key={serviceField.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                    <div className="flex-1">
                      <input type="hidden" {...register(`services.${serviceIndex}.icon`, { required: 'Icon is required' })} />
                      <IconPicker
                        value={watchedServices?.[serviceIndex]?.icon || ''}
                        onChange={(iconClass) => setValue(`services.${serviceIndex}.icon`, iconClass, { shouldValidate: true })}
                        placeholder="Select an icon..."
                      />
                      {errors.services?.[serviceIndex]?.icon && (
                        <p className="mt-1 text-sm text-red-500">{errors.services?.[serviceIndex]?.icon?.message}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        {...register(`services.${serviceIndex}.title`, { required: 'Title is required' })}
                        placeholder="Service Title"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                      />
                      {errors.services?.[serviceIndex]?.title && (
                        <p className="mt-1 text-sm text-red-500">{errors.services?.[serviceIndex]?.title?.message}</p>
                      )}
                    </div>
                    <div className="flex-2">
                      <textarea
                        {...register(`services.${serviceIndex}.content`, { required: 'Content is required' })}
                        placeholder="Service Description"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                      />
                      {errors.services?.[serviceIndex]?.content && (
                        <p className="mt-1 text-sm text-red-500">{errors.services?.[serviceIndex]?.content?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(serviceIndex)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 self-start md:self-center"
                    >
                      Remove Service
                    </button>
                  </div>

                  {/* Nested Features Array */}
                  <div className="ml-4 border-l-2 border-gray-200 pl-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    <div>
                      {(watchedServices?.[serviceIndex]?.features || []).map((_feat: Feature, featureIndex: number) => (
                        <div key={featureIndex} className="flex space-x-2 mb-2">
                          <input
                            {...register(`services.${serviceIndex}.features.${featureIndex}.text`, { required: 'Feature is required' })}
                            placeholder="Feature text"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const current = watchedServices?.[serviceIndex]?.features || [];
                              const updated = current.filter((_: Feature, i: number) => i !== featureIndex);
                              setValue(`services.${serviceIndex}.features`, updated.length > 0 ? updated : [{ text: '' }]);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedServices?.[serviceIndex]?.features || [];
                          setValue(`services.${serviceIndex}.features`, [...current, { text: '' }]);
                        }}
                        className="text-[#326101] underline hover:no-underline text-sm"
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendService({ icon: '', title: '', content: '', features: [{ text: '' }] })}
                className="text-[#326101] underline hover:no-underline"
              >
                Add Service
              </button>
            </div>

            {/* ─── CTA Section ─── */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-bold text-gray-800 mb-3">Call to Action Section</label>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CTA Title</label>
                  <input
                    {...register('ctaTitle')}
                    placeholder="e.g., Ready to Start Your Geothermal Project?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CTA Subtitle</label>
                  <textarea
                    {...register('ctaSubtitle')}
                    rows={2}
                    placeholder="e.g., Let our experts help you harness the power of geothermal energy."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Primary Button Label</label>
                    <input
                      {...register('ctaPrimaryLabel')}
                      placeholder="e.g., Get Free Consultation"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Primary Button Link</label>
                    <input
                      {...register('ctaPrimaryHref')}
                      placeholder="e.g., /about-us"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Secondary Button Label</label>
                    <input
                      {...register('ctaSecondaryLabel')}
                      placeholder="e.g., Download Service Guide"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Secondary Button Link</label>
                    <input
                      {...register('ctaSecondaryHref')}
                      placeholder="e.g., /information-center"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">This content appears at the bottom of the services section as a call-to-action.</p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServicesSectionPage;