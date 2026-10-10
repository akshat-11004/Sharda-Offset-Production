"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "NOT_INTERESTED",
] as const;

type Service = {
  id: string;
  name: string;
};

type Sample = {
  id: string;
  title: string;
};

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  preferredContact: string | null;
  status: string;
  serviceId: string | null;
  sampleId: string | null;
};

export default function EnquiryEditor({
  enquiry,
  services,
  samples,
}: {
  enquiry: Enquiry;
  services: Service[];
  samples: Sample[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(enquiry.name);
  const [phone, setPhone] = useState(enquiry.phone);
  const [email, setEmail] = useState(enquiry.email || "");
  const [message, setMessage] = useState(enquiry.message);
  const [preferredContact, setPreferredContact] = useState(
    enquiry.preferredContact || "WHATSAPP",
  );
  const [status, setStatus] = useState(enquiry.status);

  const [serviceId, setServiceId] = useState(enquiry.serviceId || "");

  const [sampleId, setSampleId] = useState(enquiry.sampleId || "");

  function reset() {
    setName(enquiry.name);
    setPhone(enquiry.phone);
    setEmail(enquiry.email || "");
    setMessage(enquiry.message);
    setPreferredContact(enquiry.preferredContact || "WHATSAPP");
    setStatus(enquiry.status);
    setServiceId(enquiry.serviceId || "");
    setSampleId(enquiry.sampleId || "");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          message,
          preferredContact,
          status,
          serviceId: serviceId || null,
          sampleId: sampleId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to update enquiry.");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update enquiry.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      `Delete the enquiry from "${enquiry.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to delete enquiry.");
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete enquiry.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-[#f6f1e9]"
        >
          Edit
        </button>

        <button
          onClick={remove}
          disabled={saving}
          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="mt-5 space-y-4 rounded-2xl border border-[#7a1f2b]/20 bg-[#fbf8f3] p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold">Name</label>

          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Phone</label>

          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Preferred contact</label>

          <select
            value={preferredContact}
            onChange={(event) => setPreferredContact(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Service</label>

          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          >
            <option value="">Custom requirement</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Sample</label>

          <select
            value={sampleId}
            onChange={(event) => setSampleId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          >
            <option value="">No sample</option>

            {samples.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Status</label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold">Customer requirement</label>

        <textarea
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#7a1f2b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
