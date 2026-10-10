"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SampleActions({
  id,
  active,
  featured,
}: {
  id: string;
  active: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle(field: "active" | "featured", value: boolean) {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/samples/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to update");
    } finally {
      setBusy(false);
    }
  }
  async function duplicate() {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/samples/${id}/duplicate`, {
        method: "POST",
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error);
      router.push(`/admin/samples/${d.sample.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to duplicate");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!confirm("Delete this sample permanently?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/samples/${id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to delete");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/samples/${id}`}
        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
      >
        Edit
      </Link>
      <button
        disabled={busy}
        onClick={() => toggle("active", !active)}
        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
      >
        {active ? "Hide" : "Show"}
      </button>
      <button
        disabled={busy}
        onClick={() => toggle("featured", !featured)}
        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        disabled={busy}
        onClick={duplicate}
        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
      >
        Duplicate
      </button>
      <button
        disabled={busy}
        onClick={remove}
        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
      >
        Delete
      </button>
    </div>
  );
}
