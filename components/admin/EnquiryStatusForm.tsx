"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "NOT_INTERESTED",
];
export default function EnquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function change(next: string) {
    setValue(next);
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Unable to update.");
      router.refresh();
    } catch (e) {
      setValue(status);
      setError(e instanceof Error ? e.message : "Unable to update.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="min-w-[190px]">
      <label className="text-xs font-semibold uppercase tracking-wide text-[#6e665f]">
        Status
        <select
          value={value}
          disabled={saving}
          onChange={(e) => change(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      {saving && <p className="mt-1 text-xs text-[#6e665f]">Saving…</p>}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
