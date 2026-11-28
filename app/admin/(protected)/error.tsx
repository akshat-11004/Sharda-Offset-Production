
"use client";

import { Feedback } from "@/components/admin/AdminUI";

export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <section className="ad-card ad-pad space-y-4">
      <h1 className="ad-section-title">Unable to load this page</h1>
      <Feedback tone="error">The workspace could not load the requested information.</Feedback>
      <button type="button" className="ad-button" onClick={retry}>Try again</button>
    </section>
  );
}
