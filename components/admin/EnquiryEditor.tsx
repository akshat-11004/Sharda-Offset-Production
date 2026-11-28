
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import type { Enquiry, EnquiryStatus } from "@prisma/client";
import { Feedback } from "./AdminUI";
import ConfirmAction from "./ConfirmAction";
import EnquiryStatusForm from "./EnquiryStatusForm";
import { enquiryStatuses, enquiryStatusLabels } from "./enquiry-status";

type Action = "edit" | "status" | "delete";

export default function EnquiryEditor({ enquiry, services, samples }: {
  enquiry: Pick<Enquiry, "id" | "name" | "phone" | "email" | "message" | "preferredContact" | "status" | "serviceId" | "sampleId">;
  services: { id: string; name: string }[];
  samples: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [nextStatus, setNextStatus] = useState<EnquiryStatus | null>(null);
  const [feedback, setFeedback] = useState<{ error?: boolean; text: string }>();
  const editButton = useRef<HTMLButtonElement>(null);
  const busy = pending || action !== null;

  async function update(nextAction: Action, body?: object) {
    if (busy) return;
    setAction(nextAction);
    setFeedback(undefined);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, nextAction === "delete" ? { method: "DELETE" } : {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to update the enquiry.");
      setOpen(false);
      if (nextAction !== "delete") setFeedback({ text: nextAction === "status" ? "Status updated." : "Enquiry saved." });
      startTransition(() => router.refresh());
    } catch (error) {
      setFeedback({ error: true, text: error instanceof Error ? error.message : "Unable to update the enquiry." });
    } finally {
      setAction(null);
      setNextStatus(null);
    }
  }

  function changeStatus(status: EnquiryStatus) {
    if (busy) return;
    setNextStatus(status);
    void update("status", { status });
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    void update("edit", {
      ...form,
      email: form.email || null,
      preferredContact: form.preferredContact || null,
      serviceId: form.serviceId || null,
      sampleId: form.sampleId || null,
    });
  }

  return (
    <div className="space-y-3">
      {open ? (
        <form className="grid gap-4" onSubmit={save}>
          <h3 className="ad-section-title">Edit enquiry</h3>
          <fieldset className="ad-form-grid min-w-0" disabled={busy}>
            <label className="ad-field">Name<input className="ad-input" name="name" required autoFocus defaultValue={enquiry.name} /></label>
            <label className="ad-field">Phone<input className="ad-input" type="tel" name="phone" required defaultValue={enquiry.phone} /></label>
            <label className="ad-field">Email<input className="ad-input" type="email" name="email" defaultValue={enquiry.email ?? ""} /></label>
            <label className="ad-field">Preferred contact
              <select className="ad-select" name="preferredContact" defaultValue={enquiry.preferredContact || ""}>
                <option value="">Not specified</option><option value="WHATSAPP">WhatsApp</option><option value="PHONE">Phone</option><option value="EMAIL">Email</option>
              </select>
            </label>
            <label className="ad-field">Service
              <select className="ad-select" name="serviceId" defaultValue={enquiry.serviceId ?? ""}>
                <option value="">Custom requirement</option>
                {services.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select>
            </label>
            <label className="ad-field">Sample
              <select className="ad-select" name="sampleId" defaultValue={enquiry.sampleId ?? ""}>
                <option value="">No sample</option>
                {samples.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
              </select>
            </label>
            <label className="ad-field">Status
              <select className="ad-select" name="status" defaultValue={enquiry.status}>
                {enquiryStatuses.map((status) => <option key={status} value={status}>{enquiryStatusLabels[status]}</option>)}
              </select>
            </label>
            <label className="ad-field ad-span">Customer message<textarea className="ad-input" name="message" rows={4} required defaultValue={enquiry.message} /></label>
          </fieldset>
          <div className="ad-actions">
            <button type="button" className="ad-button" disabled={busy} onClick={() => {
              setOpen(false);
              setFeedback(undefined);
              requestAnimationFrame(() => editButton.current?.focus());
            }}>Cancel</button>
            <button type="submit" className="ad-button ad-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      ) : (
        <div className="ad-form-footer items-end!">
          <EnquiryStatusForm status={nextStatus ?? enquiry.status} disabled={busy} onChange={changeStatus} />
          <div className="ad-actions">
            <button ref={editButton} type="button" className="ad-button" disabled={busy} onClick={() => { setFeedback(undefined); setOpen(true); }}>Edit enquiry</button>
            <ConfirmAction label="Delete" accessibleLabel={`Delete enquiry from ${enquiry.name}`} title={`Delete the enquiry from “${enquiry.name}”?`} disabled={busy} onConfirm={() => update("delete")} />
          </div>
        </div>
      )}
      {action === "status" && <p className="ad-muted text-xs" role="status">Updating status…</p>}
      {action === "delete" && <p className="ad-muted text-xs" role="status">Deleting enquiry…</p>}
      {feedback && <Feedback tone={feedback.error ? "error" : "success"}>{feedback.text}</Feedback>}
    </div>
  );
}
