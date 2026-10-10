"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: {
    samples: number;
  };
};

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");

  const [saving, setSaving] = useState(false);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingSlug(category.slug);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingSlug("");
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to create category.");
      }

      setName("");
      setSlug("");

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to create category.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateCategory(event: React.FormEvent) {
    event.preventDefault();

    if (!editingId) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName,
          slug: editingSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to update category.");
      }

      cancelEdit();
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update category.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (category._count.samples > 0) {
      alert("This category cannot be deleted because samples are using it.");
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${category.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to delete category.");
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete category.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Add category */}
      <form
        onSubmit={add}
        className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <div>
          <h2 className="font-semibold">Add category</h2>
          <p className="mt-1 text-sm text-[#6e665f]">
            Create a new portfolio category.
          </p>
        </div>

        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Wedding Cards"
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[#7a1f2b]"
        />

        <input
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="wedding-cards"
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[#7a1f2b]"
        />

        <p className="text-xs text-[#6e665f]">
          Use lowercase letters, numbers and hyphens in the slug.
        </p>

        <button
          disabled={saving}
          className="rounded-xl bg-[#7a1f2b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add category"}
        </button>
      </form>

      {/* Categories */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="border-b border-black/10 px-5 py-4">
          <h2 className="font-semibold">Categories</h2>
          <p className="mt-1 text-sm text-[#6e665f]">
            Edit or remove portfolio categories.
          </p>
        </div>

        <div className="divide-y divide-black/10">
          {initial.length === 0 ? (
            <p className="p-6 text-sm text-[#6e665f]">No categories found.</p>
          ) : (
            initial.map((category) => {
              const editing = editingId === category.id;

              return (
                <div key={category.id} className="p-5">
                  {editing ? (
                    <form onSubmit={updateCategory} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          required
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          className="w-full rounded-xl border border-black/10 px-3 py-2.5"
                        />

                        <input
                          required
                          value={editingSlug}
                          onChange={(event) =>
                            setEditingSlug(event.target.value)
                          }
                          className="w-full rounded-xl border border-black/10 px-3 py-2.5"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-xl bg-[#7a1f2b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Save changes
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{category.name}</p>

                        <p className="mt-1 text-xs text-[#6e665f]">
                          /{category.slug}
                        </p>

                        <span className="mt-2 inline-block rounded-full bg-[#f6f1e9] px-3 py-1 text-xs font-semibold">
                          {category._count.samples} samples
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-[#f6f1e9]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCategory(category)}
                          disabled={saving || category._count.samples > 0}
                          title={
                            category._count.samples > 0
                              ? "Move or delete the samples first."
                              : "Delete category"
                          }
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
