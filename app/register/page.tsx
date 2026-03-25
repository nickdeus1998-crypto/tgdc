'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Password requirements - must match server-side validation
const PW_RULES = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const allPassed = PW_RULES.every(r => r.test(form.password));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) { setError('Please meet all password requirements'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      if (data.role === 'admin') router.push('/admin'); else router.push('/admin');
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={() => setPwFocused(true)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="••••••••••••"
            />
            {(pwFocused || form.password.length > 0) && (
              <ul className="mt-2 space-y-1 text-xs">
                {PW_RULES.map((rule, i) => {
                  const passed = rule.test(form.password);
                  return (
                    <li key={i} className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{passed ? '✓' : '○'}</span>
                      <span>{rule.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button disabled={loading || !allPassed} className="w-full bg-gradient-to-r from-[#326101] to-[#639427] text-white rounded-md py-2 font-semibold disabled:opacity-60">{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="text-sm text-gray-600 mt-4">Already have an account? <a href="/login" className="text-[#326101] underline">Sign in</a></p>
      </div>
    </div>
  )
}
