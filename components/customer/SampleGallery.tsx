'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SampleCard, type PublicSample } from '@/components/customer/SampleCard';
import { trackEvent } from '@/lib/analytics';

export function SampleGallery({ samples }: { samples: PublicSample[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(samples.map((sample) => sample.category.name)))];
  const filtered = useMemo(() => samples.filter((sample) => (category === 'All' || sample.category.name === category) && `${sample.title} ${sample.category.name} ${sample.service?.name ?? ''} ${sample.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [category, query, samples]);
  function selectCategory(nextCategory: string) { setCategory(nextCategory); if (nextCategory !== category) trackEvent({ event: 'sample_search', metadata: { category: nextCategory === 'All' ? null : nextCategory, query: query || null } }); }
  function search(event: React.FormEvent) { event.preventDefault(); const value = query.trim(); if (value) trackEvent({ event: 'sample_search', metadata: { query: value, category: category === 'All' ? null : category } }); }
  return <section className="py-14"><div className="container-shell"><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => selectCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${category === item ? 'border-[var(--foreground)] bg-[var(--foreground)] text-white' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--foreground)]'}`}>{item}</button>)}</div><form onSubmit={search} className="mb-8 max-w-2xl"><label className="sr-only" htmlFor="sample-search">Search samples</label><div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"><Search size={19} className="text-[var(--muted)]"/><input id="sample-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search wedding, doctor, banner…" className="w-full bg-transparent outline-none"/></div></form>{filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((sample) => <SampleCard key={sample.slug} sample={sample}/>)}</div> : <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center"><h2 className="font-semibold">No samples found.</h2><p className="mt-2 text-sm text-[var(--muted)]">Try another search or browse all categories.</p><button onClick={() => { setQuery(''); setCategory('All'); }} className="mt-5 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white">Browse all samples</button></div>}</div></section>;
}
