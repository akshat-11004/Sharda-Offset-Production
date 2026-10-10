'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export function ServiceViewTracker({ serviceId, slug, title }: { serviceId: string; slug: string; title: string }) {
  const tracked = useRef(false);
  useEffect(() => { if (!tracked.current) { tracked.current = true; trackEvent({ event: 'service_view', metadata: { serviceId, slug, title } }); } }, [serviceId, slug, title]);
  return null;
}
