'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StakeholderLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    fetch('/api/stakeholder/me').then(r => r.json()).then(d => { if (d.user) router.replace('/stakeholder/dashboard'); });
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stakeholder/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      router.push('/stakeholder/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stakeholder Login</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} className="w-full bg-gradient-to-r from-[#326101] to-[#639427] text-white rounded-md py-2 font-semibold disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="text-sm text-gray-600 mt-4">No account? <a href="/stakeholder/register" className="text-[#326101] underline">Register</a></p>
      </div>
    </div>
  )
}
