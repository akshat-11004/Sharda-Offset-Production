"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

function PageViewTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef("");

  const queryString = searchParams.toString();

  const path = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (path === lastPath.current) return;

    lastPath.current = path;

    trackEvent({
      event: "page_view",
      path,
    });
  }, [path]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerContent />
    </Suspense>
  );
}
