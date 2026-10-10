'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export function SampleViewTracker({ sampleId, slug, title, categoryId, serviceId }: { sampleId: string; slug: string; title: string; categoryId: string; serviceId: string }) {
  const tracked = useRef(false);
  useEffect(() => { if (!tracked.current) { tracked.current = true; trackEvent({ event: 'sample_view', metadata: { sampleId, slug, title, categoryId, serviceId } }); } }, [sampleId, slug, title, categoryId, serviceId]);
  return null;
}
