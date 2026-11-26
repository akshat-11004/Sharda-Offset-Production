import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

type HeroSample = {
  slug: string;
  title: string;
  category: { name: string };
  images: { url: string; altText?: string | null }[];
};

export function Hero({ samples }: { samples: HeroSample[] }) {
  const visibleSamples = samples.slice(0, 3);
  return (
    <section className="showroom-hero" aria-labelledby="hero-heading">
      <div className="showroom-wash" aria-hidden="true" />
      <div className="showroom-grid" aria-hidden="true" />
      <div className="container-shell relative z-10 flex min-h-[calc(100svh-4rem)] flex-col justify-between py-7 sm:min-h-[calc(100svh-4.5rem)] sm:py-10 lg:min-h-[calc(100dvh-4.5rem)] lg:py-12">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow rounded-full border border-[rgba(109,36,48,.16)] bg-white/60 px-3 py-2 backdrop-blur-sm">
            Print · Design · Perfection
          </p>
          <p className="hidden text-xs font-semibold uppercase tracking-[.16em] text-[var(--muted)] sm:block">
            Nadiad, Gujarat
          </p>
        </div>
        <div className="relative py-8 sm:py-10 lg:py-6">
          <div className="hero-paper hero-paper-one" aria-hidden="true" />
          <div className="hero-paper hero-paper-two" aria-hidden="true" />
          <p className="mb-4 text-sm font-medium text-[var(--muted)] sm:mb-5">
            Premium printing for every occasion.
          </p>
          <h1 id="hero-heading" className="hero-title max-w-[13ch]">
            Your Ideas.
            <br />
            <span>Beautifully Printed.</span>
          </h1>
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <Link
              href="#products"
              className="premium-button focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--maroon)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(109,36,48,.22)]"
            >
              Explore Products <ArrowRight size={17} />
            </Link>
            <Link
              href="/samples"
              className="focus-ring inline-flex min-h-12 items-center rounded-full border border-[var(--border)] bg-white/75 px-5 text-sm font-semibold backdrop-blur-sm"
            >
              View samples
            </Link>
          </div>
        </div>
        <div className="hero-sample-row" aria-label="Featured printing samples">
          {visibleSamples.length ? (
            visibleSamples.map((sample, index) => {
              const image = sample.images[0];
              return (
                <Link
                  href={`/samples/${sample.slug}`}
                  key={sample.slug}
                  className={`hero-sample hero-sample-${index + 1} focus-ring`}
                >
                  {image ? (
                    <img src={image.url} alt={image.altText || sample.title} />
                  ) : (
                    <div className="hero-sample-fallback">
                      <small>{sample.category.name}</small>
                      <strong>{sample.title}</strong>
                    </div>
                  )}
                  <span>{sample.category.name}</span>
                </Link>
              );
            })
          ) : (
            <div className="hero-empty-samples">
              <span>Made for your moment</span>
              <strong>Real work, beautifully presented.</strong>
            </div>
          )}
        </div>
        <a
          href="#products"
          className="hero-scroll focus-ring"
          aria-label="Scroll to products"
        >
          <span>Scroll to explore</span>
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}
