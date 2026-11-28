
"use client";

import { ImageOff } from "lucide-react";
import { useCallback, useState } from "react";

function imageSource(value?: string | null) {
  const source = value?.trim().replace(/^\/?public\//, "/");
  if (!source) return undefined;
  if ((source.startsWith("/") && !source.startsWith("//")) || /^https?:\/\//i.test(source)) return source;
  return undefined;
}

export default function AdminImage({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const source = imageSource(src);
  const [failed, setFailed] = useState<string>();
  const checkImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailed(source);
  }, [source]);
  return (
    <div className={`ad-image ${className}`}>
      {source && source !== failed ? (
        <img ref={checkImage} src={source} alt={alt} loading="lazy" onError={() => setFailed(source)} />
      ) : (
        <span><ImageOff aria-hidden="true" />{src?.trim() ? "Preview unavailable" : "No image"}</span>
      )}
    </div>
  );
}
