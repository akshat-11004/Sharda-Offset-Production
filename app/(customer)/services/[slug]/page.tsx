import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SampleCard } from "@/components/customer/SampleCard";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
import { GlowingEffect } from "@/components/customer/interactions/GlowingEffect";
import { MagneticButton } from "@/components/customer/interactions/MagneticButton";
import { services } from "@/lib-data";
import { prisma } from "@/lib/prisma";
import { ServiceViewTracker } from "@/components/customer/ServiceViewTracker";
import { TrackedAnchor } from "@/components/customer/TrackedAnchor";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonicalService = services.find((item) => item.slug === slug);
  const legacyService = canonicalService ?? services.find((item) => item.slug === `${slug}s`);
  const records = await prisma.service.findMany({
    where: { slug: { in: legacyService ? [slug, legacyService.slug] : [slug] } },
    select: { id: true, slug: true, name: true, description: true, isActive: true },
  });
  const exactService = records.find((item) => item.slug === slug);
  const databaseService = exactService ?? records.find((item) => item.slug === legacyService?.slug);
  const fallback = exactService ? canonicalService : legacyService;
  const name = databaseService?.name ?? fallback?.name;
  if (!name || databaseService?.isActive === false) notFound();

  const [settings, matches] = await Promise.all([
    getSiteSettings(),
    databaseService ? prisma.sample.findMany({
      where: { isActive: true, serviceId: databaseService.id },
      include: {
        category: true,
        service: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }) : [],
  ]);
  const msg = `Hello, I am interested in ${name}. Please share details and pricing.`;
  return (
    <>
      {databaseService && (
        <ServiceViewTracker
          serviceId={databaseService.id}
          slug={slug}
          title={databaseService.name}
        />
      )}
      <main>
        <section className="py-16 md:py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div>
              <p className="eyebrow">Printing service</p>
              <h1 className="display mt-3 text-5xl md:text-6xl">
                {name}
              </h1>
              <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-8 text-[var(--muted)]">
                {databaseService?.description || fallback?.blurb}
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
                  <MagneticButton><MessageCircle size={17} /> Enquire on WhatsApp</MagneticButton>
                </TrackedAnchor>
                <Link
                  href="/contact"
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 font-semibold"
                >
                  <MagneticButton>Send enquiry <ArrowRight size={16} /></MagneticButton>
                </Link>
              </div>
            </div>
            <div data-reveal className={`service-feature service-hero service-${fallback?.accent ?? "paper"}`}>
              <GlowingEffect />
              <span>{settings.businessName.toUpperCase()}</span>
              <strong>{name}</strong>
              <small>Design • Printing • Process</small>
            </div>
          </div>
        </section>
        <section className="bg-[var(--surface)] py-20">
          <div className="container-shell">
            <div data-reveal className="flex items-end justify-between gap-5">
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
        <EnquiryCta whatsapp={settings.whatsapp} />
      </main>
    </>
  );
}
