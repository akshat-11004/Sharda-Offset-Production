'use client';

export const analyticsEvents = [
  'page_view', 'sample_view', 'sample_search', 'service_view', 'whatsapp_click',
  'phone_click', 'enquiry_started', 'enquiry_submitted', 'chatbot_open',
  'chatbot_message', 'chatbot_intent', 'chatbot_redirect', 'request_similar',
  'contact_form_submit',
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];
type AnalyticsMetadataValue = string | number | boolean | null;

export function trackEvent({ event, path = window.location.pathname, metadata }: {
  event: AnalyticsEventName;
  path?: string;
  metadata?: Record<string, AnalyticsMetadataValue>;
}) {
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, path, metadata }),
    keepalive: true,
  }).catch(() => undefined);
}
