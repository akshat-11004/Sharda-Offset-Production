"use client";

import { useState } from "react";

type Image = { id: string; url: string; altText?: string | null };

export function SampleImageGallery({ images, title }: { images: Image[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="sample-art min-h-[420px] rounded-[2rem]"><div className="sample-paper"><span>Sample</span><strong>{title}</strong><small>Sharda Offset</small></div><span className="sample-mark">SO</span></div>;
  const image = images[active];
  return <div className="grid gap-3"><a href={image.url} target="_blank" rel="noreferrer" className="focus-ring block overflow-hidden rounded-[2rem] bg-[#eee7df]" aria-label={`Open full-size image for ${title}`}><img src={image.url} alt={image.altText || title} className="aspect-[4/5] w-full object-contain sm:aspect-[5/4]" /></a>{images.length > 1 && <div className="flex snap-x gap-2 overflow-x-auto pb-1">{images.map((item, index) => <button type="button" key={item.id} onClick={() => setActive(index)} aria-label={`View image ${index + 1}`} aria-current={active === index} className={`focus-ring h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 ${active === index ? "border-[var(--maroon)]" : "border-transparent"}`}><img src={item.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div>;
}
