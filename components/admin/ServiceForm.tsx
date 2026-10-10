"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortText: string | null;
  image: string | null;
  isActive: boolean;
  displayOrder: number;
};

type ServiceFormProps = {
  service?: Service;
};

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: service?.name ?? "",
    slug: service?.slug ?? "",
    description: service?.description ?? "",
    shortText: service?.shortText ?? "",
    image: service?.image ?? "",
    isActive: service?.isActive ?? true,
    displayOrder: service?.displayOrder ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string | boolean | number,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        service ? `/api/admin/services/${service.id}` : "/api/admin/services",
        {
          method: service ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            shortText: form.shortText || undefined,
            image: form.image || undefined,
            displayOrder: Number(form.displayOrder),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to save service.");
        return;
      }

      router.push("/admin/services");
      router.refresh();
    } catch {
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteService() {
    if (!service?.id) return;

    const confirmed = window.confirm(
      `Delete "${service.name}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to delete service.");
        return;
      }

      router.push("/admin/services");
      router.refresh();
    } catch {
      setMessage("Something went wrong while deleting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="max-w-3xl space-y-6 rounded-2xl border border-[#e8dfd5] bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#272321]">
            Service name
          </label>

          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#272321]">URL slug</label>

          <input
            value={form.slug}
            onChange={(e) =>
              updateField(
                "slug",
                e.target.value.toLowerCase().replace(/\s+/g, "-"),
              )
            }
            placeholder="wedding-invitations"
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#272321]">
            Display order
          </label>

          <input
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={(e) =>
              updateField("displayOrder", Number(e.target.value))
            }
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#272321]">
            Short text
          </label>

          <input
            value={form.shortText}
            onChange={(e) => updateField("shortText", e.target.value)}
            placeholder="Short description shown on service cards."
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#272321]">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#272321]">
            Image URL
          </label>

          <input
            value={form.image}
            onChange={(e) => updateField("image", e.target.value)}
            placeholder="/images/services/wedding.jpg"
            className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
          />
        </div>

        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="size-4"
          />

          <span className="text-sm font-medium text-[#272321]">
            Show this service on the website
          </span>
        </label>
      </div>

      {message && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {service?.id && (
            <button
              type="button"
              onClick={deleteService}
              disabled={saving}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete service
            </button>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
            className="rounded-xl border border-[#dcd2c7] px-5 py-3 text-sm font-medium text-[#403a35] hover:bg-[#f6f1e9]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#7d2635] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#67202d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : service ? "Save changes" : "Create service"}
          </button>
        </div>
      </div>
    </form>
  );
}
