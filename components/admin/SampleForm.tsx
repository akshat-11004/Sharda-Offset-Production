"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Category = { id: string; name: string };
type Service = { id: string; name: string };

type SampleImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

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
  images: SampleImage[];
};

export default function SampleForm({
  sample,
  categories: initialCategories,
  services: initialServices,
}: {
  sample?: Sample;
  categories: Category[];
  services: Service[];
}) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [services, setServices] = useState(initialServices);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const [form, setForm] = useState({
    title: sample?.title ?? "",
    slug: sample?.slug ?? "",
    description: sample?.description ?? "",
    categoryId: sample?.categoryId ?? initialCategories[0]?.id ?? "",
    serviceId: sample?.serviceId ?? initialServices[0]?.id ?? "",
    material: sample?.material ?? "",
    size: sample?.size ?? "",
    tags: sample?.tags?.join(", ") ?? "",
    imageUrls: sample?.images?.map((image) => image.url).join("\n") ?? "",
    featured: sample?.isFeatured ?? false,
    active: sample?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError("");

    try {
      const [categoryResponse, serviceResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/services", { cache: "no-store" }),
      ]);

      const [categoryData, serviceData] = await Promise.all([
        categoryResponse.json(),
        serviceResponse.json(),
      ]);

      if (!categoryResponse.ok || !categoryData.ok) {
        throw new Error(categoryData.error || "Could not load categories.");
      }

      if (!serviceResponse.ok || !serviceData.ok) {
        throw new Error(serviceData.error || "Could not load services.");
      }

      const nextCategories: Category[] = categoryData.categories;
      const nextServices: Service[] = serviceData.services.filter(
        (service: Service & { isActive?: boolean }) =>
          service.isActive !== false,
      );

      setCategories(nextCategories);
      setServices(nextServices);

      setForm((previous) => ({
        ...previous,
        categoryId: nextCategories.some(
          (item) => item.id === previous.categoryId,
        )
          ? previous.categoryId
          : (nextCategories[0]?.id ?? ""),
        serviceId: nextServices.some((item) => item.id === previous.serviceId)
          ? previous.serviceId
          : (nextServices[0]?.id ?? ""),
      }));
    } catch (err) {
      setOptionsError(
        err instanceof Error ? err.message : "Could not refresh options.",
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    void refreshOptions();
  }, [refreshOptions]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.categoryId || !form.serviceId) {
        throw new Error(
          "Please create a category and an active service first.",
        );
      }

      const imageUrls = form.imageUrls
        .split(/\n+/)
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await fetch(
        sample ? `/api/admin/samples/${sample.id}` : "/api/admin/samples",
        {
          method: sample ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            description: form.description,
            categoryId: form.categoryId,
            serviceId: form.serviceId,
            material: form.material || null,
            size: form.size || null,
            tags: form.tags
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            imageUrls,
            featured: form.featured,
            active: form.active,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save sample.");
      }

      router.push("/admin/samples");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save sample.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-7"
    >
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6e665f]">
          Categories: {categories.length} · Active services: {services.length}
        </p>
        <button
          type="button"
          onClick={() => void refreshOptions()}
          disabled={loadingOptions}
          className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {loadingOptions ? "Refreshing…" : "Refresh options"}
        </button>
      </div>

      {optionsError && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {optionsError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Title"
          value={form.title}
          onChange={(v) => set("title", v)}
          required
          placeholder="Retail Promo Banner"
        />
        <Field
          label="Slug"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          required
          placeholder="retail-promo-banner"
        />

        <Select
          label="Category"
          value={form.categoryId}
          onChange={(v) => set("categoryId", v)}
          options={categories.map((c) => [c.id, c.name])}
          required
        />
        <Select
          label="Service"
          value={form.serviceId}
          onChange={(v) => set("serviceId", v)}
          options={services.map((s) => [s.id, s.name])}
          required
        />

        {categories.length === 0 && (
          <p className="text-sm text-red-700">
            No categories found. Create a category, then refresh options.
          </p>
        )}
        {services.length === 0 && (
          <p className="text-sm text-red-700">
            No active services found. Activate a service, then refresh options.
          </p>
        )}

        <Field
          label="Material"
          value={form.material}
          onChange={(v) => set("material", v)}
          placeholder="300 GSM Art Card"
        />
        <Field
          label="Size"
          value={form.size}
          onChange={(v) => set("size", v)}
          placeholder="24 × 36 inches"
        />
      </div>

      <label className="block text-sm font-medium">
        Description
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="mt-2 min-h-32 w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7a1f2b]/20"
          placeholder="Describe this printing sample..."
        />
      </label>

      <label className="block text-sm font-medium">
        Image URLs{" "}
        <span className="ml-2 text-xs font-normal text-[#6e665f]">
          Optional — one URL per line
        </span>
        <textarea
          value={form.imageUrls}
          onChange={(e) => set("imageUrls", e.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7a1f2b]/20"
          placeholder={
            "https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"
          }
        />
        <p className="mt-1 text-xs text-[#6e665f]">
          You can add one or multiple image URLs.
        </p>
      </label>

      <Field
        label="Tags"
        value={form.tags}
        onChange={(v) => set("tags", v)}
        placeholder="banner, retail, large-format"
      />

      <div className="flex flex-wrap gap-6">
        <Toggle
          label="Featured"
          checked={form.featured}
          onChange={(v) => set("featured", v)}
        />
        <Toggle
          label="Active / visible"
          checked={form.active}
          onChange={(v) => set("active", v)}
        />
      </div>

      <button
        type="submit"
        disabled={
          saving ||
          loadingOptions ||
          categories.length === 0 ||
          services.length === 0
        }
        className="rounded-xl bg-[#7a1f2b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : sample ? "Save changes" : "Create sample"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#7a1f2b]/20"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
