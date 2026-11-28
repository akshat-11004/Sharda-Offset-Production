
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import { Badge, EmptyState, PageHeader } from "@/components/admin/AdminUI";

export default async function AdminServicesPage() {
  await requireOwner();
  const services = await prisma.service.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });

  return (
    <div className="ad-page">
      <PageHeader title="Services" description="Manage service details, website visibility and display order." actions={
        <Link href="/admin/services/new" className="ad-button ad-primary"><Plus aria-hidden="true" /> Add service</Link>
      } />
      <section className="ad-card" aria-label="Service list">
        {services.length ? (
          <ul className="ad-list">
            {services.map((service) => (
              <li key={service.id} className="ad-pad grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <div className="ad-actions">
                    <h2 className="ad-section-title">{service.name}</h2>
                    <Badge tone={service.isActive ? "active" : undefined}>{service.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="ad-muted mt-1 text-xs">/services/{service.slug} · Order {service.displayOrder}</p>
                  {service.description && <p className="ad-muted mt-2 line-clamp-2 text-sm">{service.description}</p>}
                </div>
                <div><Link href={`/admin/services/${service.id}`} className="ad-button" aria-label={`Edit ${service.name}`}><Pencil aria-hidden="true" /> Edit</Link></div>
              </li>
            ))}
          </ul>
        ) : <EmptyState>No services yet. Add a service to start your list.</EmptyState>}
      </section>
    </div>
  );
}
