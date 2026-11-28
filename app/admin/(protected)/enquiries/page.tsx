
import { MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import { Badge, EmptyState, PageHeader } from "@/components/admin/AdminUI";
import EnquiryEditor from "@/components/admin/EnquiryEditor";
import { enquiryStatusLabels } from "@/components/admin/enquiry-status";

export const dynamic = "force-dynamic";

const enquiryDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const contactLabels: Record<string, string> = { PHONE: "Phone", WHATSAPP: "WhatsApp", EMAIL: "Email" };

export default async function AdminEnquiriesPage() {
  await requireOwner();
  const [enquiries, services, samples] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, include: { service: true, sample: true } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.sample.findMany({ where: { isActive: true }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="ad-page">
      <PageHeader title="Enquiries" description="Review customer requirements, follow up and update enquiry status." />
      {enquiries.length ? (
        <div className="grid gap-4">
          {enquiries.map((item) => {
            const phone = item.phone.replace(/[^+\d]/g, "");
            const digits = phone.replace(/\D/g, "");
            const whatsapp = !phone.startsWith("+") && digits.length === 10 ? `91${digits}` : digits;
            return (
              <article key={item.id} className="ad-card ad-pad space-y-4">
                <header className="ad-section-head">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="ad-section-title">{item.name}</h2>
                      <Badge tone={item.status}>{enquiryStatusLabels[item.status]}</Badge>
                    </div>
                    <p className="ad-muted mt-1 text-sm">{item.phone}{item.email ? ` · ${item.email}` : ""}</p>
                  </div>
                  <time className="ad-muted text-xs" dateTime={item.createdAt.toISOString()}>{enquiryDate.format(item.createdAt)}</time>
                </header>
                <dl className="ad-grid rounded-lg bg-[var(--ad-bg)] p-3 text-sm">
                  <div><dt className="ad-muted text-xs font-bold">Service</dt><dd>{item.service?.name || "Custom requirement"}</dd></div>
                  <div><dt className="ad-muted text-xs font-bold">Sample</dt><dd>{item.sample?.title || "None selected"}</dd></div>
                  <div><dt className="ad-muted text-xs font-bold">Preferred contact</dt><dd>{item.preferredContact ? contactLabels[item.preferredContact] ?? item.preferredContact : "Not specified"}</dd></div>
                  <div><dt className="ad-muted text-xs font-bold">Enquiry ID</dt><dd>{item.id}</dd></div>
                </dl>
                <div>
                  <h3 className="ad-muted text-xs font-bold">Customer message</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p>
                </div>
                {digits.length >= 7 && (
                  <div className="ad-actions">
                    <a className="ad-button" href={`tel:${phone}`}><Phone aria-hidden="true" /> Call</a>
                    <a className="ad-button" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> WhatsApp</a>
                  </div>
                )}
                <div className="border-t border-[var(--ad-line)] pt-4">
                  <EnquiryEditor
                    enquiry={item}
                    services={item.service && !item.service.isActive ? [...services, item.service] : services}
                    samples={item.sample && !item.sample.isActive ? [...samples, item.sample] : samples}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="ad-card"><EmptyState>No enquiries yet. Customer messages will appear here.</EmptyState></div>}
    </div>
  );
}
