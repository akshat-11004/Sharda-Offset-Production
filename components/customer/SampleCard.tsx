import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ViewTransition } from "react";
import { GlowingEffect } from "./interactions/GlowingEffect";

export type PublicSample = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  service?: { name: string; slug: string } | null;
  tags: string[];
  images: { url: string; altText?: string | null }[];
};

export function SampleCard({ sample, compact = false, reveal = true }: { sample: PublicSample; compact?: boolean; reveal?: boolean }) {
  const primaryImage = sample.images[0];

  return (
    <article data-reveal={reveal ? "" : undefined} className="sample-interactive overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_40px_rgba(33,30,27,.04)]">
      <Link href={`/samples/${sample.slug}`} className="sample-link focus-ring block" aria-label={`View ${sample.title}`}>
        {primaryImage ? (
          <ViewTransition name={`print-sample-${sample.id}`} share="sample-morph" default="none">
            <div data-cursor="sample" className={`overflow-hidden bg-[#eee7df] ${compact ? "h-48" : "h-64 sm:h-72"}`}>
              <img src={primaryImage.url} alt={primaryImage.altText || sample.title} className="card-image h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
          </ViewTransition>
        ) : (
          <div data-cursor="sample" className={`sample-art ${compact ? "sample-art-compact" : ""}`}>
            <div className="sample-paper">
              <span>{sample.tags[0] || "Sample"}</span>
              <strong>{sample.title}</strong>
              <small>{sample.category.name}</small>
            </div>
            <span className="sample-mark">SO</span>
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--maroon)]">{sample.category.name}</p>
              <h3 className="mt-1 font-semibold">{sample.title}</h3>
            </div>
            <span aria-hidden="true" className="card-arrow grid size-9 shrink-0 place-items-center rounded-full border border-[var(--border)]">
              <ArrowUpRight size={16} />
            </span>
          </div>
          {!compact && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{sample.description}</p>}
        </div>
      </Link>
      <GlowingEffect />
    </article>
  );
}