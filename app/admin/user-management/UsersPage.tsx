'use client';

import { useEffect, useMemo, useState } from 'react';

interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface FormState {
  name: string;
  email: string;
  role: string;
  password: string;
}

const emptyForm: FormState = {
  name: '',
  email: '',
  role: 'admin',
  password: '',
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load users');
      setUsers(data.items || []);
      setCurrentUserId(data.currentUserId ?? null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email.trim() || (!editingId && form.password.length < 6)) {
      setStatus('Email and password (min 6 chars) are required.');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const payload: Record<string, string | null> = {
        name: form.name.trim() || '',
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      const res = await fetch(editingId ? `/api/admin/users/${editingId}` : '/api/admin/users', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error || 'Failed to save user.');
        return;
      }
      setStatus(editingId ? 'User updated successfully.' : 'User created successfully.');
      setForm(emptyForm);
      setEditingId(null);
      await loadUsers();
    } catch {
      setStatus('Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
    });
    setStatus(null);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    setDeletingId(id);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(data?.error || 'Failed to delete user.');
        return;
      }
      setStatus('User deleted.');
      await loadUsers();
    } catch {
      setStatus('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedUsers = useMemo(
    () => users.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users],
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
              {loading && <span className="text-xs text-gray-500">Loading…</span>}
            </div>
            {sortedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No admin users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 px-3 font-medium">Email</th>
                      <th className="py-2 px-3 font-medium">Role</th>
                      <th className="py-2 px-3 font-medium">Created</th>
                      <th className="py-2 pl-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedUsers.map((user) => (
                      <tr key={user.id} className="align-top">
                        <td className="py-3 pr-3">
                          <p className="font-medium text-gray-900">{user.name || '—'}</p>
                          <p className="text-xs text-gray-500">#{user.id}</p>
                        </td>
                        <td className="py-3 px-3 text-gray-700 break-all">{user.email}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 pl-3 text-right space-x-3">
                          <button
                            onClick={() => onEdit(user)}
                            className="text-sm text-emerald-700 hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(user.id)}
                            disabled={deletingId === user.id || user.id === currentUserId}
                            className="text-sm text-red-600 hover:underline font-medium disabled:opacity-50"
                          >
                            {currentUserId === user.id ? 'You' : deletingId === user.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit User' : 'Add New User'}</h2>
              {status && <span className="text-xs text-gray-500">{status}</span>}
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingId ? 'Leave blank to keep current password' : ''}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500"
                  required={!editingId}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setStatus(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingId ? 'Update user' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
