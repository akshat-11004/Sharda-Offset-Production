
"use client";

import { useEffect, useState, type FormEvent } from "react";
import AdminImage from "@/components/admin/AdminImage";
import { Feedback, FormSection, PageHeader } from "@/components/admin/AdminUI";

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

const fieldNames: Record<keyof Settings, string> = {
  businessName: "Business name",
  logoUrl: "Logo URL",
  address: "Address",
  phonePrimary: "Primary phone",
  phoneSecondary: "Secondary phone",
  whatsapp: "WhatsApp number",
  email: "Email",
  hours: "Business hours",
  whatsappMessage: "Default WhatsApp message",
};

function settingsForm(settings: Settings) {
  return Object.fromEntries(Object.keys(fieldNames).map((field) => [field, settings[field as keyof Settings] ?? ""])) as Settings;
}

export default function AdminSettingsPage() {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [form, setForm] = useState<Settings>();
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean }>();
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({});

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/settings", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data.settings) throw new Error();
        if (controller.signal.aborted) return;
        setForm(settingsForm(data.settings));
        setState("loaded");
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [retry]);

  function change(field: keyof Settings, value: string) {
    setForm((current) => current && { ...current, [field]: value });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(undefined);
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || saving) return;
    setSaving(true);
    setFeedback(undefined);
    setErrors({});

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.settings) {
        const validation = data.details?.fieldErrors;
        if (validation) {
          setErrors(Object.fromEntries(Object.keys(fieldNames).filter((field) => validation[field]?.length).map((field) => [field, validation[field][0]])));
        }
        setFeedback({ text: validation ? "Check the highlighted settings and try again." : "Failed to save settings.", error: true });
        return;
      }
      setForm(settingsForm(data.settings));
      setFeedback({ text: "Settings saved successfully." });
    } catch {
      setFeedback({ text: "Failed to save settings. Please try again.", error: true });
    } finally {
      setSaving(false);
    }
  }

  function field(name: keyof Settings, options: { type?: string; rows?: number; required?: boolean; hint?: string; full?: boolean } = {}) {
    const { type = "text", rows, required, hint, full } = options;
    const message = errors[name] ?? hint;
    const props = {
      className: "ad-input",
      id: `settings-${name}`,
      value: form?.[name] ?? "",
      required,
      "aria-invalid": Boolean(errors[name]) || undefined,
      "aria-describedby": message ? `settings-${name}-help` : undefined,
    };
    return (
      <div className={`ad-field ${full ? "ad-span" : ""}`}>
        <label htmlFor={props.id}>{fieldNames[name]}{required && " *"}</label>
        {rows ? <textarea {...props} rows={rows} onChange={(event) => change(name, event.target.value)} /> : <input {...props} type={type} onChange={(event) => change(name, event.target.value)} />}
        {message && <small id={`settings-${name}-help`} className={errors[name] ? "!text-red-800" : undefined}>{message}</small>}
      </div>
    );
  }

  return (
    <div className="ad-page">
      <PageHeader title="Website settings" description="Update the business information shown to customers." />
      {state === "loading" && <div className="ad-card ad-pad ad-muted text-sm" role="status">Loading settings…</div>}
      {state === "error" && (
        <div className="ad-card ad-pad space-y-3">
          <Feedback tone="error">Could not load the saved settings.</Feedback>
          <button type="button" className="ad-button" onClick={() => { setState("loading"); setRetry(retry + 1); }}>Try again</button>
        </div>
      )}
      {state === "loaded" && form && (
        <form className="ad-form" onSubmit={saveSettings}>
          <fieldset className="grid min-w-0 gap-4" disabled={saving}>
            <FormSection title="Business profile" description="Fields marked with * are required.">
              <div className="ad-form-grid">
                {field("businessName", { required: true })}
                {field("hours", { required: true })}
                {field("logoUrl", { full: true, hint: "Use a hosted image URL or a local path such as /images/logo.jpeg." })}
                {form.logoUrl.trim() && <AdminImage src={form.logoUrl} alt="Business logo preview" className="max-w-40 rounded-lg ad-span" />}
                {field("address", { rows: 3, full: true, required: true })}
              </div>
            </FormSection>
            <FormSection title="Contact information">
              <div className="ad-form-grid">
                {field("phonePrimary", { type: "tel", required: true })}
                {field("phoneSecondary", { type: "tel" })}
                {field("email", { type: "email", required: true })}
              </div>
            </FormSection>
            <FormSection title="WhatsApp">
              <div className="ad-form-grid">
                {field("whatsapp", { type: "tel", required: true })}
                {field("whatsappMessage", { rows: 3, full: true })}
              </div>
            </FormSection>
          </fieldset>
          {feedback && <Feedback tone={feedback.error ? "error" : "success"}>{feedback.text}</Feedback>}
          <div className="ad-actions sm:justify-end">
            <button className="ad-button ad-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
