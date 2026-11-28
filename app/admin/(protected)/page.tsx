
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Folders, Images, Inbox, Plus, Settings, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import { Badge, EmptyState, PageHeader } from "@/components/admin/AdminUI";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import { enquiryStatusLabels } from "@/components/admin/enquiry-status";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireOwner();
  const [enquiries, newEnquiries, samples, featured, services, categories, recent] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.sample.count({ where: { isActive: true } }),
    prisma.sample.count({ where: { isActive: true, isFeatured: true } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { service: true, sample: true } }),
  ]);

  const metrics = [
    ["New enquiries", newEnquiries, Inbox],
    ["Active samples", samples, Images],
    ["Featured samples", featured, Star],
    ["Active services", services, BriefcaseBusiness],
  ] as const;

  return (
    <div className="ad-page">
      <PageHeader title="Owner dashboard" description="Manage your printing portfolio and customer enquiries." actions={<Link className="ad-button ad-primary" href="/admin/samples/new"><Plus aria-hidden="true" /> Add sample</Link>} />
      <dl className="ad-stats">
        {metrics.map(([label, value, Icon]) => (
          <div key={label} className="ad-card ad-pad">
            <span className="ad-stat-icon mb-3"><Icon aria-hidden="true" /></span>
            <dt className="ad-muted text-xs font-bold sm:text-sm">{label}</dt>
            <dd className="mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl">{value.toLocaleString("en-IN")}</dd>
          </div>
        ))}
      </dl>
      <section className="ad-card ad-pad space-y-3">
        <h2 className="ad-section-title">Quick actions</h2>
        <div className="ad-actions">
          <Link className="ad-button" href="/admin/samples"><Images aria-hidden="true" /> Manage samples</Link>
          <Link className="ad-button" href="/admin/categories"><Folders aria-hidden="true" /> Categories ({categories})</Link>
          <Link className="ad-button" href="/admin/services"><BriefcaseBusiness aria-hidden="true" /> Manage services</Link>
          <Link className="ad-button" href="/admin/settings"><Settings aria-hidden="true" /> Website settings</Link>
        </div>
      </section>
      <section className="ad-card">
        <div className="ad-pad ad-section-head">
          <div>
            <h2 className="ad-section-title">Recent enquiries</h2>
            <p className="ad-muted text-sm">{enquiries.toLocaleString("en-IN")} total</p>
          </div>
          <Link href="/admin/enquiries" className="ad-button">View enquiries <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        {recent.length ? (
          <ul className="ad-list border-t border-[var(--ad-line)]">
            {recent.map((item) => (
              <li key={item.id} className="ad-pad grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                <div><p className="font-bold">{item.name}</p><p className="ad-muted text-sm">{item.phone}{item.email ? ` · ${item.email}` : ""}</p></div>
                <div><p className="text-sm">{item.service?.name || "Custom requirement"}</p>{item.sample && <p className="ad-muted text-xs">{item.sample.title}</p>}</div>
                <Badge tone={item.status}>{enquiryStatusLabels[item.status]}</Badge>
              </li>
            ))}
          </ul>
        ) : <EmptyState>No enquiries yet.</EmptyState>}
      </section>
      <AnalyticsPanel />
    </div>
  );
}
