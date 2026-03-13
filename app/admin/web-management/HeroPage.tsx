'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import MediaPicker from '../components/MediaPicker';

interface HeroButton {
  label: string;
  href: string;
  visible: boolean;
}

interface HeroData {
  title: string;
  subheading: string;
  highlight?: string;
  imageUrl?: string;
  images?: string[];
  buttons?: HeroButton[];
}

const HeroPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<HeroData>({
    defaultValues: {
      title: '',
      subheading: '',
      highlight: '',
      imageUrl: '',
      images: [],
    },
  });
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagesInput, setImagesInput] = useState<string>('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Buttons state
  const [buttons, setButtons] = useState<HeroButton[]>([
    { label: 'Start Your Project', href: '/about-us', visible: true },
    { label: 'View Case Studies', href: '/projects', visible: true },
  ]);

  // Fetch existing hero data on mount
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get('/api/hero');
        setHeroData(response.data);
        reset(response.data);
        if (response.data.imageUrl) {
          setImagePreview(response.data.imageUrl);
        }
        if (Array.isArray(response.data.images)) {
          setImagesInput(response.data.images.join('\n'));
          setImagesList(response.data.images);
        }
        if (Array.isArray(response.data.buttons) && response.data.buttons.length > 0) {
          setButtons(response.data.buttons);
        }
      } catch (err) {
        console.error('Error fetching hero data:', err);
        setError('Failed to load hero data.');
      }
    };
    fetchHeroData();
  }, [reset]);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }
      setIsUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('files', file);
        const response = await axios.post('/api/admin/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadedUrl = response.data.items[0].url;
        setImagePreview(uploadedUrl);
        setImagesList((prev) => {
          if (prev.includes(uploadedUrl)) return prev;
          const next = [...prev, uploadedUrl];
          setImagesInput(next.join('\n'));
          return next;
        });
      } catch (err) {
        console.error('Error uploading image:', err);
        setError('Failed to upload image. Using local preview instead.');
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle form submission
  const onSubmit = async (data: HeroData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const parsedFromText = imagesInput
        .split(/\n|,/)
        .map((v) => v.trim())
        .filter(Boolean);
      const combined = Array.from(new Set([...imagesList, ...parsedFromText]));
      const imageUrl = imagePreview && !imagePreview.startsWith('blob:') ? imagePreview : data.imageUrl || '';

      const response = await axios.post('/api/hero', {
        ...data,
        imageUrl,
        images: combined,
        buttons,
      });
      setHeroData(response.data);
      reset(response.data);
      if (Array.isArray(response.data.images)) {
        setImagesInput(response.data.images.join('\n'));
        setImagesList(response.data.images);
      }
      if (Array.isArray(response.data.buttons)) {
        setButtons(response.data.buttons);
      }
      alert('Hero section updated successfully!');
    } catch (err) {
      setError('Failed to update hero section. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button helpers
  const updateButton = (index: number, field: keyof HeroButton, value: string | boolean) => {
    setButtons((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const addButton = () => {
    setButtons((prev) => [...prev, { label: '', href: '/', visible: true }]);
  };

  const removeButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hero Section</h2>
          <p className="text-gray-600 mb-6">Edit hero section content and call-to-action buttons.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title
              </label>
              <input
                id="title"
                type="text"
                className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 placeholder-gray-400`}
                placeholder="Enter hero title"
                {...register('title', {
                  required: 'Hero title is required',
                  maxLength: { value: 100, message: 'Title must be 100 characters or less' },
                })}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="subheading" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subheading
              </label>
              <textarea
                id="subheading"
                className={`w-full px-3 py-2 border ${errors.subheading ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 placeholder-gray-400`}
                rows={3}
                placeholder="Enter hero subheading"
                {...register('subheading', {
                  required: 'Subheading is required',
                  maxLength: { value: 200, message: 'Subheading must be 200 characters or less' },
                })}
              />
              {errors.subheading && <p className="mt-1 text-sm text-red-500">{errors.subheading.message}</p>}
            </div>

            <div>
              <label htmlFor="highlight" className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Text
              </label>
              <input
                id="highlight"
                type="text"
                className={`w-full px-3 py-2 border ${errors.highlight ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 placeholder-gray-400`}
                placeholder="Enter highlight text"
                {...register('highlight', {
                  required: 'Highlight text is required',
                  maxLength: { value: 50, message: 'Highlight must be 50 characters or less' },
                })}
              />
              {errors.highlight && <p className="mt-1 text-sm text-red-500">{errors.highlight.message}</p>}
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 file:bg-gray-100 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-gray-700"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              {isUploading && <p className="mt-2 text-sm text-[#326101] animate-pulse">Uploading image...</p>}
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Hero preview" className="h-40 w-auto rounded-lg" />
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slider Images (one URL per line or comma separated)
              </label>
              <textarea
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101] placeholder-gray-400"
                placeholder={"https://example.com/hero1.jpg\nhttps://example.com/hero2.jpg"}
              />
              <p className="text-xs text-gray-500 mt-1">These images will rotate in the homepage hero slider. First image is used as primary.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Add from uploads</p>
              </div>
              <div className="max-w-md">
                <MediaPicker
                  label="Pick from media library"
                  helperText="Choose an uploaded image to add to the slider."
                  value=""
                  onChange={(url) => {
                    if (!url) return;
                    setImagesList((prev) => {
                      if (prev.includes(url)) return prev;
                      const next = [...prev, url];
                      setImagesInput(next.join('\n'));
                      return next;
                    });
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {imagesList.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Current slider images</p>
                  <ul className="space-y-2">
                    {imagesList.map((img) => (
                      <li key={img} className="flex items-center justify-between text-sm text-gray-700">
                        <span className="truncate max-w-[80%]">{img}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = imagesList.filter((u) => u !== img);
                            setImagesList(next);
                            setImagesInput(next.join('\n'));
                          }}
                          className="text-red-600 hover:underline text-xs"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ─── CTA Buttons ─── */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Call-to-Action Buttons</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Configure the buttons displayed on the hero section. Toggle visibility on/off.</p>
                </div>
                <button
                  type="button"
                  onClick={addButton}
                  className="inline-flex items-center gap-1 text-sm text-[#326101] font-medium hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Button
                </button>
              </div>

              <div className="space-y-3">
                {buttons.map((btn, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 border rounded-xl transition-colors ${btn.visible ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    {/* Visibility toggle */}
                    <button
                      type="button"
                      onClick={() => updateButton(index, 'visible', !btn.visible)}
                      className={`mt-1 flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${btn.visible ? 'bg-[#326101]' : 'bg-gray-300'
                        }`}
                      title={btn.visible ? 'Click to hide' : 'Click to show'}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${btn.visible ? 'left-[18px]' : 'left-0.5'
                          }`}
                      />
                    </button>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) => updateButton(index, 'label', e.target.value)}
                        placeholder="e.g. Start Your Project"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900 text-sm"
                      />
                    </div>

                    {/* Link */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Link URL</label>
                      <input
                        type="text"
                        value={btn.href}
                        onChange={(e) => updateButton(index, 'href', e.target.value)}
                        placeholder="e.g. /about-us"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] text-gray-900 text-sm"
                      />
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeButton(index)}
                      className="mt-6 flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                {buttons.length === 0 && (
                  <div className="text-center py-6 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    No buttons configured. Click &ldquo;Add Button&rdquo; to create one.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#326101] text-white rounded-lg hover:bg-[#2a5101] disabled:bg-gray-400 transition-colors"
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

export default HeroPage;
