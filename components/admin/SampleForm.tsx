
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Feedback, FormSection } from "./AdminUI";
import SampleImages, { getSampleImageUrls } from "./SampleImages";

type Category = { id: string; name: string };
type Service = { id: string; name: string; isActive: boolean };
type Sample = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  serviceId: string;
  material: string | null;
  size: string | null;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  images: { url: string }[];
};

export default function SampleForm({ sample, categories: initialCategories, services: initialServices }: {
  sample?: Sample;
  categories: Category[];
  services: Service[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [services, setServices] = useState(initialServices);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsFeedback, setOptionsFeedback] = useState<{ text: string; error?: boolean }>();
  const [form, setForm] = useState({
    title: sample?.title ?? "",
    slug: sample?.slug ?? "",
    description: sample?.description ?? "",
    categoryId: sample?.categoryId ?? initialCategories[0]?.id ?? "",
    serviceId: sample?.serviceId ?? initialServices[0]?.id ?? "",
    material: sample?.material ?? "",
    size: sample?.size ?? "",
    tags: sample?.tags.join(", ") ?? "",
    imageUrls: sample?.images.map((image) => image.url).join("\n") ?? "",
    featured: sample?.isFeatured ?? false,
    active: sample?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = saving || pending;

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function refreshOptions() {
    if (loadingOptions || busy) return;
    setLoadingOptions(true);
    setOptionsFeedback(undefined);
    try {
      const [categoryResponse, serviceResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/services", { cache: "no-store" }),
      ]);
      if (!categoryResponse.ok || !serviceResponse.ok) throw new Error();
      const [categoryData, serviceData] = await Promise.all([categoryResponse.json(), serviceResponse.json()]);
      if (!categoryData.ok || !serviceData.ok) throw new Error();
      const nextCategories: Category[] = categoryData.categories;
      const nextServices = (serviceData.services as Service[]).filter((service) => service.isActive || service.id === sample?.serviceId);
      setCategories(nextCategories);
      setServices(nextServices);
      setForm((previous) => ({
        ...previous,
        categoryId: nextCategories.some(({ id }) => id === previous.categoryId) ? previous.categoryId : "",
        serviceId: nextServices.some(({ id }) => id === previous.serviceId) ? previous.serviceId : "",
      }));
      setOptionsFeedback({ text: "Categories and services refreshed." });
    } catch {
      setOptionsFeedback({ text: "Could not refresh categories and services.", error: true });
    } finally {
      setLoadingOptions(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || loadingOptions) return;
    setError("");

    const imageUrls = getSampleImageUrls(form.imageUrls);
    if (!sample && imageUrls.length > 20) {
      setError("Add up to 20 image links.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(sample ? `/api/admin/samples/${sample.id}` : "/api/admin/samples", {
        method: sample ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          material: form.material || null,
          size: form.size || null,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          imageUrls,
        }),
      });
      if (!response.ok) {
        const data = response.status === 400 ? await response.json() : {};
        setError(data.error || "Unable to save the sample. Check that the slug is unique and try again.");
        return;
      }
      startTransition(() => {
        router.push("/admin/samples");
        router.refresh();
      });
    } catch {
      setError("Unable to save the sample. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="ad-form" onSubmit={submit}>
      <fieldset disabled={busy} className="grid min-w-0 gap-4">
        <FormSection title="Sample details" description="Fields marked with * are required.">
          <div className="ad-form-grid">
            <label className="ad-field">Title *<input className="ad-input" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Retail Promo Banner" /></label>
            <label className="ad-field">URL slug *<input className="ad-input" value={form.slug} onChange={(e) => set("slug", e.target.value)} required placeholder="retail-promo-banner" spellCheck={false} /></label>
            <label className="ad-field ad-span">Description<textarea className="ad-input" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} /></label>
            <label className="ad-field">Material<input className="ad-input" value={form.material} onChange={(e) => set("material", e.target.value)} /></label>
            <label className="ad-field">Size<input className="ad-input" value={form.size} onChange={(e) => set("size", e.target.value)} /></label>
            <label className="ad-field ad-span">Tags<input className="ad-input" value={form.tags} onChange={(e) => set("tags", e.target.value)} aria-describedby="sample-tags-help" /><small id="sample-tags-help">Separate tags with commas.</small></label>
          </div>
        </FormSection>
        <FormSection title="Category and service">
          <div className="ad-form-grid">
            <label className="ad-field">Category *<select required className="ad-select" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}><option value="">Select a category</option>{categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className="ad-field">Service *<select required className="ad-select" value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)}><option value="">Select a service</option>{services.map(({ id, name, isActive }) => <option key={id} value={id}>{name}{isActive ? "" : " (inactive)"}</option>)}</select></label>
          </div>
          {!categories.length && <Feedback>No categories available. <Link className="underline" href="/admin/categories">Manage categories</Link></Feedback>}
          {!services.length && <Feedback>No active services available. <Link className="underline" href="/admin/services">Manage services</Link></Feedback>}
          <div><button type="button" className="ad-button" onClick={refreshOptions} disabled={loadingOptions}>{loadingOptions ? "Refreshing…" : "Refresh options"}</button></div>
          {optionsFeedback && <Feedback tone={optionsFeedback.error ? "error" : "success"}>{optionsFeedback.text}</Feedback>}
        </FormSection>
        <SampleImages value={form.imageUrls} onChange={(value) => set("imageUrls", value)} disabled={busy} />
        <FormSection title="Visibility">
          <div className="ad-actions gap-x-6">
            <label className="ad-toggle"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Show in portfolio</label>
            <label className="ad-toggle"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature this sample</label>
          </div>
        </FormSection>
      </fieldset>
      {error && <Feedback tone="error">{error}</Feedback>}
      <div className="ad-actions sm:justify-end">
        <Link href="/admin/samples" className="ad-button">Cancel</Link>
        <button type="submit" className="ad-button ad-primary" disabled={busy || loadingOptions || !categories.length || !services.length}>
          {busy ? "Saving…" : sample ? "Save changes" : "Create sample"}
        </button>
      </div>
    </form>
  );
}
