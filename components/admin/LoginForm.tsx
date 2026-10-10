'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to sign in.');
      router.replace('/admin');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Owner access</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#292522]">Sign in</h1>
        <p className="mt-2 text-sm text-[#6e665f]">Access your Sharda Offset workspace.</p>
      </div>
      <label className="block text-sm font-medium">Email<input required type="email" name="email" autoComplete="username" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3" /></label>
      <label className="block text-sm font-medium">Password<input required type="password" name="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[#7a1f2b] px-5 py-3.5 font-semibold text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
