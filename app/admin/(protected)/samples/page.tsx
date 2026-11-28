
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import SampleActions from "@/components/admin/SampleActions";
import AdminImage from "@/components/admin/AdminImage";
import { Badge, EmptyState, PageHeader } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export default async function AdminSamplesPage() {
  await requireOwner();
  const samples = await prisma.sample.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, service: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="ad-page">
      <PageHeader title="Samples" description="Manage the work displayed in your printing portfolio." actions={
        <Link href="/admin/samples/new" className="ad-button ad-primary"><Plus aria-hidden="true" /> Add sample</Link>
      } />
      {samples.length ? (
        <div className="ad-grid ad-sample-grid">
          {samples.map((sample) => (
            <article key={sample.id} className="ad-card flex flex-col overflow-hidden">
              <AdminImage src={sample.images[0]?.url} alt={sample.images[0]?.altText || sample.title} className="!aspect-[16/9] max-h-52" />
              <div className="ad-pad flex flex-1 flex-col gap-3">
                <div className="ad-section-head">
                  <h2 className="ad-section-title">{sample.title}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={sample.isActive ? "active" : undefined}>{sample.isActive ? "Active" : "Hidden"}</Badge>
                    {sample.isFeatured && <Badge tone="featured">Featured</Badge>}
                  </div>
                </div>
                <p className="ad-muted text-sm">{sample.category.name} · {sample.service.name}</p>
                {sample.tags.length > 0 && (
                  <p className="ad-muted text-xs">{sample.tags.slice(0, 4).map((tag) => `#${tag}`).join(" · ")}</p>
                )}
                <div className="mt-auto border-t border-[var(--ad-line)] pt-3">
                  <SampleActions id={sample.id} title={sample.title} active={sample.isActive} featured={sample.isFeatured} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="ad-card"><EmptyState>No samples yet. Add a sample to start your portfolio.</EmptyState></div>}
    </div>
  );
}
