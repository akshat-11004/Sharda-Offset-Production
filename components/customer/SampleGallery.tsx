"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SampleCard, type PublicSample } from "./SampleCard";
import { trackEvent } from "@/lib/analytics";

export function SampleGallery({ samples }: { samples: PublicSample[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const results = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previousResults = useRef<PublicSample[] | null>(null);
  const categories = ["All", ...Array.from(new Set(samples.map((sample) => sample.category.name)))];
  const filtered = useMemo(() => samples.filter((sample) =>
    (category === "All" || sample.category.name === category) &&
    `${sample.title} ${sample.category.name} ${sample.service?.name ?? ""} ${sample.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query, samples]);

  useEffect(() => {
    const previous = previousResults.current;
    previousResults.current = filtered;
    if (!previous || (previous.length === filtered.length && previous.every((sample, index) => sample === filtered[index]))) return;
    if (document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = results.current?.animate(
      [{ opacity: .85, translate: "0 4px" }, { opacity: 1, translate: "none" }],
      { duration: 200, easing: "ease-out" },
    );
    return () => animation?.cancel();
  }, [filtered]);

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    if (nextCategory !== category) trackEvent({
      event: "sample_search",
      metadata: { category: nextCategory === "All" ? null : nextCategory, query: query || null },
    });
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) trackEvent({ event: "sample_search", metadata: { query: value, category: category === "All" ? null : category } });
  }

  return (
    <section className="py-14">
      <div className="container-shell">
        <div className="filter-tabs mb-8" aria-label="Sample categories" role="group" data-native-scroll>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => selectCategory(item)}
              aria-pressed={category === item}
              className="filter-tab whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm hover:border-[var(--maroon)]"
            >
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={search} className="mb-8 max-w-2xl">
          <label className="sr-only" htmlFor="sample-search">Search samples</label>
          <div className="sample-search flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
            <Search size={19} className="text-[var(--muted)]" aria-hidden="true" />
            <input ref={searchInput} id="sample-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search wedding, doctor, banner…" className="w-full bg-transparent outline-none" />
          </div>
        </form>
        <p className="sr-only" role="status">{filtered.length} {filtered.length === 1 ? "sample" : "samples"} found</p>
        <div ref={results}>
          {filtered.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((sample) => <SampleCard key={sample.slug} sample={sample} reveal={false} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center sm:p-12">
              <h2 className="font-semibold">No samples found.</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Try another search or browse all categories.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("All"); searchInput.current?.focus(); }} className="mt-5 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white">Browse all samples</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}