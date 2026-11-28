
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { Service } from "@prisma/client";
import AdminImage from "./AdminImage";
import { Feedback, FormSection } from "./AdminUI";
import ConfirmAction from "./ConfirmAction";

export default function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [image, setImage] = useState(service?.image ?? "");
  const [action, setAction] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState("");
  const busy = action !== null || pending;
  const endpoint = service ? `/api/admin/services/${service.id}` : "/api/admin/services";

  async function request(nextAction: "save" | "delete", body?: object) {
    if (busy) return;
    setAction(nextAction);
    setError("");
    const fallback = nextAction === "delete" ? "Unable to delete the service." : "Unable to save the service.";

    try {
      const response = await fetch(endpoint, nextAction === "delete" ? { method: "DELETE" } : {
        method: service ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || fallback);
      startTransition(() => {
        router.push("/admin/services");
        router.refresh();
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : fallback);
    } finally {
      setAction(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void request("save", {
      name: fields.get("name"),
      slug: fields.get("slug"),
      description: fields.get("description"),
      shortText: fields.get("shortText") || undefined,
      image: image || undefined,
      displayOrder: Number(fields.get("displayOrder")),
      isActive: fields.has("isActive"),
    });
  }

  return (
    <form onSubmit={submit} className="ad-form">
      <fieldset className="grid min-w-0 gap-4" disabled={busy}>
        <FormSection title="Service details" description="Fields marked with * are required.">
          <div className="ad-form-grid">
            <label className="ad-field">Service name *<input className="ad-input" name="name" required defaultValue={service?.name} /></label>
            <label className="ad-field">URL slug *<input className="ad-input" name="slug" required defaultValue={service?.slug} placeholder="wedding-invitations" spellCheck={false} /></label>
            <label className="ad-field ad-span">Short text<input className="ad-input" name="shortText" defaultValue={service?.shortText ?? ""} /><small>Appears on service cards.</small></label>
            <label className="ad-field ad-span">Description *<textarea className="ad-input" name="description" rows={5} required defaultValue={service?.description} /></label>
          </div>
        </FormSection>
        <FormSection title="Website presentation">
          <div className="ad-form-grid">
            <label className="ad-field ad-span">Image URL<input className="ad-input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/services/wedding.jpg" spellCheck={false} /></label>
            {image.trim() && <AdminImage src={image} alt="Service image preview" className="max-w-48 rounded-lg ad-span" />}
            <label className="ad-field">Display order<input className="ad-input" type="number" name="displayOrder" min="0" defaultValue={service?.displayOrder ?? 0} /></label>
            <label className="ad-toggle self-end"><input type="checkbox" name="isActive" defaultChecked={service?.isActive ?? true} />Show on the website</label>
          </div>
        </FormSection>
      </fieldset>
      {error && <Feedback tone="error">{error}</Feedback>}
      <div className="ad-form-footer">
        {service && <ConfirmAction label="Delete service" title={`Delete “${service.name}”?`} disabled={busy} onConfirm={() => request("delete")} />}
        <div className="ad-actions sm:ml-auto">
          <Link href="/admin/services" className="ad-button">Cancel</Link>
          <button type="submit" disabled={busy} className="ad-button ad-primary">{action === "delete" ? "Deleting…" : busy ? "Saving…" : service ? "Save changes" : "Create service"}</button>
        </div>
      </div>
    </form>
  );
}
