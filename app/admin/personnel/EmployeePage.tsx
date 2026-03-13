'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Employee {
    id: number;
    name: string;
    designation: string;
    position: string;
    department: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    bio: string | null;
    imageUrl: string | null;
    createdAt: string;
}

const EmployeePage: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(isAdmin === true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const [form, setForm] = useState({
        id: null as number | null,
        name: '',
        designation: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        imageUrl: ''
    });

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.items || []);
                if (isAdmin === undefined) {
                    setCanManage(data.canManage === true);
                }
            }
        } catch {
            setError('Failed to load employee directory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [employees, searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `/api/admin/employees/${form.id}` : '/api/admin/employees';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess('Saved successfully');
                resetForm();
                load();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const d = await res.json();
                setError(d.error || 'Failed to save employee');
            }
        } catch {
            setError('Failed to save employee');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setForm({
            id: null, name: '', designation: '', position: '',
            department: '', email: '', phone: '', location: '', bio: '', imageUrl: ''
        });
    };

    const handleEdit = (emp: Employee) => {
        setForm({
            id: emp.id,
            name: emp.name,
            designation: emp.designation,
            position: emp.position,
            department: emp.department || '',
            email: emp.email || '',
            phone: emp.phone || '',
            location: emp.location || '',
            bio: emp.bio || '',
            imageUrl: emp.imageUrl || ''
        });
        setError(null);
        setSuccess(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this employee?')) return;
        try {
            const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
            if (res.ok) load();
        } catch {
            setError('Failed to delete employee');
        }
    };

    /* ── Avatar helper ── */
    const Avatar = ({ emp, size = 'md' }: { emp: Employee; size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClass = size === 'lg' ? 'w-28 h-28 text-3xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
        if (emp.imageUrl) {
            return <img src={emp.imageUrl} alt={emp.name} className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm`} />;
        }
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#326101] to-[#639427] flex items-center justify-center text-white font-semibold shadow-sm`}>
                {emp.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    /* ── Detail Modal ── */
    const EmployeeDetailModal = ({ employee, onClose }: { employee: Employee; onClose: () => void }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="relative h-24 bg-gradient-to-r from-[#326101] to-[#639427]">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-full transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="px-6 pb-8">
                    {/* Avatar */}
                    <div className="relative -mt-14 mb-4 flex justify-center">
                        <div className="border-4 border-white rounded-full shadow-lg">
                            <Avatar emp={employee} size="lg" />
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{employee.name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{employee.position}</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {employee.designation}
                            </span>
                            {employee.department && (
                                <span className="text-xs text-gray-400">{employee.department}</span>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        {employee.email && (
                            <a href={`mailto:${employee.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors group">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-sm text-gray-600">{employee.email}</span>
                            </a>
                        )}
                        {employee.phone && (
                            <a href={`tel:${employee.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors group">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-sm text-gray-600">{employee.phone}</span>
                            </a>
                        )}
                        {employee.location && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-sm text-gray-600">{employee.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {employee.bio && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">About</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{employee.bio}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm">
                        <span>{success}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ── Add / Edit Form ── */}
                    {canManage && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-8">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        {form.id ? 'Edit Employee' : 'Add Employee'}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Designation</label>
                                            <input
                                                type="text"
                                                value={form.designation}
                                                onChange={e => setForm({ ...form, designation: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                                placeholder="e.g. Technical"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Position</label>
                                            <input
                                                type="text"
                                                value={form.position}
                                                onChange={e => setForm({ ...form, position: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                                placeholder="e.g. Manager"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Department <span className="text-gray-400 font-normal">(optional)</span></label>
                                        <input
                                            type="text"
                                            value={form.department}
                                            onChange={e => setForm({ ...form, department: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                            placeholder="e.g. Operations"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                                placeholder="john@tgdc.go.tz"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                                placeholder="+255..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Bio / Notes</label>
                                        <textarea
                                            value={form.bio}
                                            onChange={e => setForm({ ...form, bio: e.target.value })}
                                            rows={2}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm resize-none"
                                            placeholder="Short background..."
                                        />
                                    </div>

                                    {/* Photo upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Photo <span className="text-gray-400 font-normal">(optional)</span></label>
                                        {form.imageUrl ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <img src={form.imageUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                                <p className="text-xs text-gray-500 flex-1 truncate">{form.imageUrl}</p>
                                                <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={form.imageUrl}
                                                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-gray-900 text-sm"
                                                    placeholder="Paste image URL"
                                                />
                                                <label className="px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    Upload
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const fd = new FormData();
                                                            fd.append('files', file);
                                                            try {
                                                                const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
                                                                const data = await res.json();
                                                                if (data?.items?.[0]?.url) {
                                                                    setForm(prev => ({ ...prev, imageUrl: data.items[0].url }));
                                                                }
                                                            } catch {
                                                                setError('Failed to upload image');
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#326101] to-[#639427] hover:shadow-md disabled:opacity-50 transition-all"
                                        >
                                            {saving ? 'Saving...' : form.id ? 'Update' : 'Add Employee'}
                                        </button>
                                        {form.id && (
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── Directory List ── */}
                    <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Directory</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">{filteredEmployees.length} staff member{filteredEmployees.length !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by name, position..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-[#326101] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                                        <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Loading directory...
                                    </div>
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="text-center py-16">
                                        <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <p className="text-gray-400 text-sm">No matching staff found.</p>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {filteredEmployees.map(emp => (
                                            <div key={emp.id} className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                                {/* Avatar with image support */}
                                                <Avatar emp={emp} />

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#326101] transition-colors">
                                                        {emp.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{emp.position}</p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            {emp.designation}
                                                        </span>
                                                        {emp.department && (
                                                            <span className="text-[10px] text-gray-400">{emp.department}</span>
                                                        )}
                                                    </div>

                                                    {/* Contact */}
                                                    {(emp.email || emp.phone) && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-gray-50 space-y-1">
                                                            {emp.email && (
                                                                <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                                                            )}
                                                            {emp.phone && (
                                                                <p className="text-xs text-gray-400">{emp.phone}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <button
                                                            onClick={() => setSelectedEmployee(emp)}
                                                            className="text-xs font-medium text-[#326101] hover:underline"
                                                        >
                                                            View Profile →
                                                        </button>
                                                        {canManage && (
                                                            <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEdit(emp)}
                                                                    className="p-1.5 text-gray-400 hover:text-[#326101] hover:bg-emerald-50 rounded-md transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(emp.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedEmployee && <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
        </div>
    );
};

export default EmployeePage;
