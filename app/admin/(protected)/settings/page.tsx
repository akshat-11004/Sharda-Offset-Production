"use client";

import { useEffect, useState } from "react";

type Settings = {
  businessName: string;
  logoUrl: string;
  address: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  hours: string;
  whatsappMessage: string;
};
const defaults: Settings = {
  businessName: "Sharda Offset",
  logoUrl: "public/images/logo.jpg",
  address:
    "5 priti complex, Santram Road, Opp. Riddhi Laboratory, Nadiad, Gujarat",
  phonePrimary: "9825405898",
  phoneSecondary: "8866600582",
  whatsapp: "9825405898",
  email: "shardaoffset@gmail.com",
  hours: "9:00 AM - 7:00 PM",
  whatsappMessage:
    "Hello, I would like to know more about your printing services.",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        if (response.ok && data.settings) {
          setForm({
            businessName: data.settings.businessName ?? "",
            logoUrl: data.settings.logoUrl ?? "",
            address: data.settings.address ?? "",
            phonePrimary: data.settings.phonePrimary ?? "",
            phoneSecondary: data.settings.phoneSecondary ?? "",
            whatsapp: data.settings.whatsapp ?? "",
            email: data.settings.email ?? "",
            hours: data.settings.hours ?? "",
            whatsappMessage: data.settings.whatsappMessage ?? "",
          });
        }
      } catch {
        setMessage("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(field: keyof Settings, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to save settings.");
        return;
      }

      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-[#6e665f]">Website configuration</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#272321]">
            Settings
          </h1>
        </div>

        <div className="rounded-2xl border border-[#e8dfd5] bg-white p-6 text-sm text-[#6e665f]">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#6e665f]">Website configuration</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#272321]">Settings</h1>

        <p className="mt-2 text-sm text-[#6e665f]">
          Update the business information used across your website.
        </p>
      </div>

      <form
        onSubmit={saveSettings}
        className="max-w-3xl space-y-6 rounded-2xl border border-[#e8dfd5] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#272321]">
              Business name
            </label>

            <input
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#272321]">
              Brand logo URL
            </label>

            <input
              value={form.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              placeholder="/images/logo.png"
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />

            <p className="mt-2 text-xs text-[#6e665f]">
              Example: /images/logo.png
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#272321]">
              Address
            </label>

            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#272321]">
              Primary phone
            </label>

            <input
              value={form.phonePrimary}
              onChange={(e) => updateField("phonePrimary", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#272321]">
              Secondary phone
            </label>

            <input
              value={form.phoneSecondary}
              onChange={(e) => updateField("phoneSecondary", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#272321]">
              WhatsApp number
            </label>

            <input
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="+919825405898"
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#272321]">Email</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#272321]">
              Business hours
            </label>

            <input
              value={form.hours}
              onChange={(e) => updateField("hours", e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#272321]">
              WhatsApp default message
            </label>

            <textarea
              value={form.whatsappMessage}
              onChange={(e) => updateField("whatsappMessage", e.target.value)}
              rows={3}
              placeholder="Hello Sharda Offset, I would like to know more about your printing services."
              className="mt-2 w-full rounded-xl border border-[#dcd2c7] px-4 py-3 text-sm outline-none focus:border-[#7d2635]"
            />
          </div>
        </div>

        {message && (
          <div className="rounded-xl bg-[#f8f1e9] px-4 py-3 text-sm text-[#5f554d]">
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#7d2635] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#67202d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
