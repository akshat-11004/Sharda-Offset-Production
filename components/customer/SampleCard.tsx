import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';

export type PublicSample = {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  service?: { name: string; slug: string } | null;
  tags: string[];
  images: { url: string; altText?: string | null }[];
};

export function SampleCard({ sample, compact = false }: { sample: PublicSample; compact?: boolean }) {
  const primaryImage = sample.images[0];
  const style = { '--sample-style': 'var(--maroon)' } as CSSProperties;
  return <article className="group overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_40px_rgba(33,30,27,.04)]">
    <Link href={`/samples/${sample.slug}`} className="focus-ring block" aria-label={`View ${sample.title}`}>
      {primaryImage ? <img src={primaryImage.url} alt={primaryImage.altText || sample.title} className={`w-full object-cover ${compact ? 'h-44' : 'h-56'}`} /> : <div className={`sample-art ${compact ? 'sample-art-compact' : ''}`} style={style}><div className="sample-paper"><span>{sample.tags[0] || 'Sample'}</span><strong>{sample.title}</strong><small>{sample.category.name}</small></div><span className="sample-mark">SO</span></div>}
      <div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--maroon)]">{sample.category.name}</p><h3 className="mt-1 font-semibold">{sample.title}</h3></div><span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--border)] transition group-hover:-translate-y-1 group-hover:bg-[var(--foreground)] group-hover:text-white"><ArrowUpRight size={16}/></span></div>{!compact && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{sample.description}</p>}</div>
    </Link>
  </article>;
}
