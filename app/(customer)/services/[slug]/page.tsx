import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
// import { Navbar } from '@/components/customer/Navbar';
import { SampleCard } from "@/components/customer/SampleCard";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
// import { WhatsAppFab } from '@/components/customer/WhatsAppFab';
import { business, services } from "@/lib-data";
import { prisma } from "@/lib/prisma";
import { ServiceViewTracker } from "@/components/customer/ServiceViewTracker";
import { TrackedAnchor } from "@/components/customer/TrackedAnchor";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const settings = await getSiteSettings();
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const [databaseService, matches] = await Promise.all([
    prisma.service.findUnique({
      where: { slug },
      select: { id: true, name: true },
    }),
    prisma.sample.findMany({
      where: { isActive: true, service: { slug } },
      include: {
        category: true,
        service: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const msg = `Hello, I am interested in ${service.name}. Please share details and pricing.`;
  return (
    <>
      {databaseService && (
        <ServiceViewTracker
          serviceId={databaseService.id}
          slug={slug}
          title={databaseService.name}
        />
      )}
      {/* <Navbar /> */}
      <main>
        <section className="py-16 md:py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div>
              <p className="eyebrow">Printing service</p>
              <h1 className="display mt-3 text-5xl md:text-6xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                {service.blurb}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedAnchor
                  event="whatsapp_click"
                  metadata={{
                    location: "service_detail",
                    serviceId: databaseService?.id || null,
                  }}
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-5 py-3 font-semibold text-white"
                >
                  <MessageCircle size={17} /> Enquire on WhatsApp
                </TrackedAnchor>
                <Link
                  href="/contact"
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 font-semibold"
                >
                  Send enquiry <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className={`service-hero service-${service.accent}`}>
              <span>{settings.businessName.toUpperCase()}</span>
              <strong>{service.name}</strong>
              <small>PRINT • DESIGN • CREATE</small>
            </div>
          </div>
        </section>
        <section className="bg-[var(--surface)] py-20">
          <div className="container-shell">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Samples</p>
                <h2 className="display mt-3 text-4xl">See related work.</h2>
              </div>
              <Link
                href="/samples"
                className="text-sm font-semibold text-[var(--maroon)]"
              >
                Browse all →
              </Link>
            </div>
            {matches.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {matches.map((sample) => (
                  <SampleCard key={sample.slug} sample={sample} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
                <p className="font-semibold">
                  More samples are coming to this category.
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Tell the shop what you need and they can guide you directly.
                </p>
              </div>
            )}
          </div>
        </section>
        <EnquiryCta />
      </main>
      {/* <WhatsAppFab /> */}
    </>
  );
}
