'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import MediaPicker from '../components/MediaPicker';

interface HeaderData {
    id?: number;
    emblemUrl?: string;
    logoUrl?: string;
    topTitle: string;
    mainTitle: string;
    tanescoMail: string;
    tgdcMail: string;
}

const HeaderPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<HeaderData>({
        defaultValues: {
            emblemUrl: '',
            logoUrl: '',
            topTitle: 'United Republic of Tanzania',
            mainTitle: 'Tanzania Geothermal Development Company',
            tanescoMail: 'https://mail.tanesco.go.tz',
            tgdcMail: 'https://mail.tgdc.go.tz',
        },
    });

    const [emblemPreview, setEmblemPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploadingEmblem, setIsUploadingEmblem] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    useEffect(() => {
        const fetchHeaderData = async () => {
            try {
                const response = await axios.get('/api/header');
                if (response.data && (response.data.id || response.data.mainTitle)) {
                    reset(response.data);
                    if (response.data.emblemUrl) setEmblemPreview(response.data.emblemUrl);
                    if (response.data.logoUrl) setLogoPreview(response.data.logoUrl);
                }
            } catch (err) {
                console.error('Error fetching header data:', err);
                setError('Failed to load header data.');
            }
        };
        fetchHeaderData();
    }, [reset]);

    const handleFileUpload = async (file: File, type: 'emblem' | 'logo') => {
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB.');
            return;
        }

        if (type === 'emblem') setIsUploadingEmblem(true);
        else setIsUploadingLogo(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('files', file);

            const response = await axios.post('/api/admin/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const uploadedUrl = response.data.items[0].url;
            if (type === 'emblem') setEmblemPreview(uploadedUrl);
            else setLogoPreview(uploadedUrl);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image.');
        } finally {
            if (type === 'emblem') setIsUploadingEmblem(false);
            else setIsUploadingLogo(false);
        }
    };

    const onSubmit = async (data: HeaderData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const { id, ...saveData } = data;
            await axios.post('/api/header', {
                ...saveData,
                emblemUrl: emblemPreview,
                logoUrl: logoPreview,
            });
            alert('Header settings updated successfully!');
        } catch (err) {
            setError('Failed to update header settings.');
            console.error('Error submitting form:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Header Settings</h2>
                    <p className="text-gray-600 mb-6">Configure logos, titles and mail links for the site header.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Logo Management */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">Logo Management</h3>

                                {/* Emblem Upload */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Left Emblem (Coat of Arms)</label>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                                            {emblemPreview ? (
                                                <img src={emblemPreview} alt="Emblem" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] text-gray-400 text-center px-1 font-medium italic">/emblem.png (Default)</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'emblem')}
                                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                                                disabled={isUploadingEmblem}
                                            />
                                            {isUploadingEmblem && <p className="text-xs text-emerald-600 mt-1 animate-pulse font-medium">Uploading emblem...</p>}
                                        </div>
                                    </div>
                                    <MediaPicker
                                        label="Pick from media library"
                                        value=""
                                        onChange={(url) => setEmblemPreview(url)}
                                    />
                                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Recommended: <strong>80 × 80 px</strong>, PNG with transparent background
                                    </p>
                                </div>

                                {/* TGDC Logo Upload */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Right Logo (TGDC Logo)</label>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] text-gray-400 text-center px-1 font-medium italic">/tgdc.png (Default)</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                                                disabled={isUploadingLogo}
                                            />
                                            {isUploadingLogo && <p className="text-xs text-emerald-600 mt-1 animate-pulse font-medium">Uploading logo...</p>}
                                        </div>
                                    </div>
                                    <MediaPicker
                                        label="Pick from media library"
                                        value=""
                                        onChange={(url) => setLogoPreview(url)}
                                    />
                                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Recommended: <strong>100 × 100 px</strong>, PNG with transparent background
                                    </p>
                                </div>
                            </div>

                            {/* Title & Mail Settings */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">Content & Links</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Top Title (United Republic of Tanzania)</label>
                                        <input
                                            {...register('topTitle', { required: 'Top title is required' })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all text-gray-900"
                                            placeholder="United Republic of Tanzania"
                                        />
                                        {errors.topTitle && <p className="text-xs text-red-500 mt-1">{errors.topTitle.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Title (TGDC Name)</label>
                                        <input
                                            {...register('mainTitle', { required: 'Main title is required' })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all text-gray-900"
                                            placeholder="Tanzania Geothermal Development Company"
                                        />
                                        {errors.mainTitle && <p className="text-xs text-red-500 mt-1">{errors.mainTitle.message}</p>}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Utility Links</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">TANESCO Mail Link</label>
                                                <input
                                                    {...register('tanescoMail', { required: 'TANESCO mail link is required' })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all text-gray-900"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">TGDC Mail Link</label>
                                                <input
                                                    {...register('tgdcMail', { required: 'TGDC mail link is required' })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploadingEmblem || isUploadingLogo}
                                className="px-8 py-3 bg-gradient-to-r from-[#326101] to-[#4c8f02] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-md uppercase tracking-wide text-sm"
                            >
                                {isSubmitting ? 'Saving Settings...' : 'Save Header Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HeaderPage;
