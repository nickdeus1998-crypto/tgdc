'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface HeroData {
  title: string;
  subheading: string;
  highlight?: string;
  imageUrl?: string;
}

const HeroPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<HeroData>({
    defaultValues: {
      title: '',
      subheading: '',
      highlight: '',
      imageUrl: '',
    },
  });
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing hero data on mount
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get('/api/hero');
        setHeroData(response.data);
        reset(response.data); // Populate form with existing data
        if (response.data.imageUrl) {
          setImagePreview(response.data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching hero data:', err);
        setError('Failed to load hero data.');
      }
    };
    fetchHeroData();
  }, [reset]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }
      // Clean up previous preview URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up image preview URL on unmount
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
      // Placeholder for actual image upload (e.g., Cloudinary)
      const imageUrl = imagePreview && !imagePreview.startsWith('blob:') ? imagePreview : data.imageUrl || '';
      const response = await axios.post('/api/hero', {
        ...data,
        imageUrl,
      });
      setHeroData(response.data);
      reset(response.data); // Reset form with new data
      alert('Hero section updated successfully!'); // Replace with toast in production
    } catch (err) {
      setError('Failed to update hero section. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
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
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
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
                className={`w-full px-3 py-2 border ${
                  errors.subheading ? 'border-red-500' : 'border-gray-200'
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
                className={`w-full px-3 py-2 border ${
                  errors.highlight ? 'border-red-500' : 'border-gray-200'
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
              />
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Hero preview" className="h-40 w-auto rounded-lg" />
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

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