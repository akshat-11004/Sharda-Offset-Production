"use client";

import { useState, ViewTransition } from "react";

type Image = { id: string; url: string; altText?: string | null };

export function SampleImageGallery({ images, title, sampleId }: { images: Image[]; title: string; sampleId: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="sample-art min-h-[420px] rounded-[2rem]"><div className="sample-paper"><span>Sample</span><strong>{title}</strong><small>Sharda Offset</small></div><span className="sample-mark">SO</span></div>;
  const image = images[active] ?? images[0];

  return (
    <div className="grid gap-3">
      <a href={image.url} target="_blank" rel="noreferrer" data-cursor="full-image" className="focus-ring block overflow-hidden rounded-[2rem] bg-[#eee7df]" aria-label={`Open full-size image for ${title}`}>
        <ViewTransition name={image === images[0] ? `print-sample-${sampleId}` : undefined} share="sample-morph" default="none">
          <img key={image.id} src={image.url} alt={image.altText || title} className="paper-image aspect-[4/5] w-full object-contain sm:aspect-[5/4]" />
        </ViewTransition>
      </a>
      {images.length > 1 && (
        <div className="flex snap-x gap-2 overflow-x-auto px-1 pt-1 pb-2" data-native-scroll>
          {images.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={image.id === item.id}
              className={`sample-thumbnail focus-ring h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 ${image.id === item.id ? "border-[var(--maroon)]" : "border-transparent"}`}
            >
              <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}