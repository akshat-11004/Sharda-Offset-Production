
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Badge, EmptyState, Feedback, FormSection } from "./AdminUI";
import ConfirmAction from "./ConfirmAction";

type Category = { id: string; name: string; slug: string; _count: { samples: number } };

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ area: string; text: string; error?: boolean }>();
  const busy = saving !== null || pending;

  function closeEdit(id: string) {
    setEditingId(null);
    requestAnimationFrame(() => document.getElementById(`edit-category-${id}`)?.focus());
  }

  async function mutate(method: "POST" | "PATCH" | "DELETE", category?: Category, form?: HTMLFormElement) {
    if (busy) return;
    const area = category?.id ?? "add";
    setSaving(area);
    setFeedback(undefined);

    try {
      const response = await fetch(`/api/admin/categories${category ? `/${category.id}` : ""}`, {
        method,
        ...(form && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not save the category.");
      if (method === "POST") form?.reset();
      if (method === "PATCH" && category) closeEdit(category.id);
      const messages = { POST: "Category added.", PATCH: "Category updated.", DELETE: "Category deleted." };
      setFeedback({ area: method === "POST" ? "add" : "list", text: messages[method] });
      startTransition(() => router.refresh());
    } catch (error) {
      setFeedback({ area, text: error instanceof Error ? error.message : "Could not update the category.", error: true });
    } finally {
      setSaving(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>, category?: Category) {
    event.preventDefault();
    void mutate(category ? "PATCH" : "POST", category, event.currentTarget);
  }

  function message(area: string) {
    return feedback?.area === area && <Feedback tone={feedback.error ? "error" : "success"}>{feedback.text}</Feedback>;
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,320px)_minmax(0,1fr)]">
      <form onSubmit={submit}>
        <FormSection title="Add category">
          <CategoryFields />
          {message("add")}
          <div><button type="submit" className="ad-button ad-primary" disabled={busy}>{saving === "add" ? "Adding…" : "Add category"}</button></div>
        </FormSection>
      </form>
      <section className="ad-card">
        <div className="ad-pad space-y-3">
          <h2 className="ad-section-title">Portfolio categories <span className="ad-muted text-sm">({initial.length})</span></h2>
          {message("list")}
        </div>
        {initial.length ? (
          <ul className="ad-list border-t border-[var(--ad-line)]">
            {initial.map((category) => (
              <li key={category.id} className="ad-pad space-y-3">
                {editingId === category.id ? (
                  <form onSubmit={(event) => submit(event, category)} className="grid gap-3">
                    <CategoryFields category={category} />
                    <div className="ad-actions">
                      <button type="button" className="ad-button" disabled={busy} onClick={() => { closeEdit(category.id); setFeedback(undefined); }}>Cancel</button>
                      <button type="submit" className="ad-button ad-primary" disabled={busy}>{saving === category.id ? "Saving…" : "Save changes"}</button>
                    </div>
                  </form>
                ) : (
                  <div className="ad-section-head">
                    <div className="min-w-0">
                      <h3 className="font-bold">{category.name}</h3>
                      <p className="ad-muted my-1 text-sm">/{category.slug}</p>
                      <Badge>{category._count.samples} {category._count.samples === 1 ? "sample" : "samples"}</Badge>
                    </div>
                    <div>
                      <div className="ad-actions">
                        <button id={`edit-category-${category.id}`} type="button" className="ad-button" aria-label={`Edit ${category.name}`} disabled={busy} onClick={() => { setEditingId(category.id); setFeedback(undefined); }}>Edit</button>
                        <ConfirmAction label="Delete" accessibleLabel={`Delete ${category.name}`} title={`Delete “${category.name}”?`} disabled={busy || category._count.samples > 0} onConfirm={() => mutate("DELETE", category)} />
                      </div>
                      {category._count.samples > 0 && <p className="ad-muted mt-1 text-xs">Move linked samples before deleting.</p>}
                    </div>
                  </div>
                )}
                {message(category.id)}
              </li>
            ))}
          </ul>
        ) : <EmptyState>No categories yet. Add one to organize your samples.</EmptyState>}
      </section>
    </div>
  );
}

function CategoryFields({ category }: { category?: Category }) {
  return (
    <>
      <label className="ad-field">Category name<input className="ad-input" required name="name" autoFocus={Boolean(category)} defaultValue={category?.name} placeholder="Wedding Cards" /></label>
      <label className="ad-field">URL slug<input className="ad-input" required name="slug" defaultValue={category?.slug} placeholder="wedding-cards" spellCheck={false} /><small>Use lowercase letters, numbers and hyphens.</small></label>
    </>
  );
}
