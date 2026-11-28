
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Eye, EyeOff, Pencil, Star } from "lucide-react";
import ConfirmAction from "./ConfirmAction";
import { Feedback } from "./AdminUI";

type Action = "visibility" | "featured" | "duplicate" | "delete";

export default function SampleActions({ id, title, active, featured }: { id: string; title: string; active: boolean; featured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState<{ error?: boolean; signIn?: boolean; text: string }>();
  const busy = activeAction !== null || pending;
  const endpoint = `/api/admin/samples/${id}`;

  async function run(action: Action) {
    if (busy) return;
    setActiveAction(action);
    setFeedback(undefined);
    try {
      const toggle = action === "visibility" || action === "featured";
      const response = await fetch(
        toggle ? `${endpoint}/toggle` : action === "duplicate" ? `${endpoint}/duplicate` : endpoint,
        toggle ? {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action === "featured" ? { field: "featured", value: !featured } : { field: "active", value: !active }),
        } : { method: action === "duplicate" ? "POST" : "DELETE" },
      );

      if (response.status === 401) {
        setFeedback({ error: true, signIn: true, text: "Your owner session ended." });
        return;
      }

      const data = await response.json().catch(() => null);
      if (!response.ok || (!data?.ok && !data?.success)) {
        if (response.status === 404 && typeof data?.error === "string") {
          setFeedback({ error: true, text: data.error });
          return;
        }
        throw new Error();
      }

      startTransition(() => {
        if (action === "duplicate") router.push(`/admin/samples/${data.sample.id}`);
        else router.refresh();
      });
      if (action === "visibility") setFeedback({ text: active ? "Sample hidden." : "Sample visible." });
      if (action === "featured") setFeedback({ text: featured ? "Removed from featured samples." : "Sample featured." });
    } catch {
      const operation = { visibility: "update visibility", featured: "update featured status", duplicate: "duplicate the sample", delete: "delete the sample" }[action];
      setFeedback({ error: true, text: `Could not ${operation}. Please try again.` });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="ad-actions">
        <Link href={`/admin/samples/${id}`} className="ad-button" aria-label={`Edit ${title}`}><Pencil aria-hidden="true" /> Edit</Link>
        <button type="button" className="ad-button" disabled={busy} onClick={() => run("visibility")}>{active ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}{active ? "Hide" : "Show"}</button>
        <button type="button" className="ad-button" disabled={busy} onClick={() => run("featured")}><Star aria-hidden="true" />{featured ? "Unfeature" : "Feature"}</button>
        <button type="button" className="ad-button" disabled={busy} onClick={() => run("duplicate")}><Copy aria-hidden="true" /> Duplicate</button>
        <ConfirmAction label="Delete" accessibleLabel={`Delete ${title}`} title={`Delete “${title}”?`} disabled={busy} onConfirm={() => run("delete")} />
      </div>
      {busy && <p className="ad-muted text-xs" role="status">Updating sample…</p>}
      {feedback && (
        <Feedback tone={feedback.error ? "error" : "success"}>
          {feedback.text}
          {feedback.signIn && <> <Link href="/admin/login" className="font-bold underline">Sign in again</Link>.</>}
        </Feedback>
      )}
    </div>
  );
}
