'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { trackEvent, type AnalyticsEventName } from '@/lib/analytics';

type MetadataValue = string | number | boolean | null;
type Props = ComponentPropsWithoutRef<'a'> & { event: AnalyticsEventName; secondaryEvent?: AnalyticsEventName; metadata?: Record<string, MetadataValue>; children: ReactNode };

export function TrackedAnchor({ event, secondaryEvent, metadata, onClick, children, ...props }: Props) {
  return <a {...props} onClick={(click) => { trackEvent({ event, metadata }); if (secondaryEvent) trackEvent({ event: secondaryEvent, metadata }); onClick?.(click); }}>{children}</a>;
}
