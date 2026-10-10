import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
// import { Navbar } from "@/components/customer/Navbar";
import { SampleCard } from "@/components/customer/SampleCard";
// import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
import { business } from "@/lib-data";
import { prisma } from "@/lib/prisma";
import { SampleViewTracker } from "@/components/customer/SampleViewTracker";
import { TrackedAnchor } from "@/components/customer/TrackedAnchor";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
const settings = await getSiteSettings();
export default async function SampleDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sample = await prisma.sample.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      service: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!sample) notFound();
  const related = await prisma.sample.findMany({
    where: {
      isActive: true,
      categoryId: sample.categoryId,
      id: { not: sample.id },
    },
    include: {
      category: true,
      service: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  const msg = `Hello, I am interested in a design similar to: ${sample.title}. Please share details and pricing.`;

  return (
    <>
      <SampleViewTracker
        sampleId={sample.id}
        slug={sample.slug}
        title={sample.title}
        categoryId={sample.categoryId}
        serviceId={sample.serviceId}
      />
      {/* <Navbar /> */}
      <main>
        <section className="py-12 md:py-16">
          <div className="container-shell">
            <Link
              href="/samples"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-1 py-2 text-sm font-semibold text-[var(--muted)]"
            >
              <ArrowLeft size={16} /> Back to samples
            </Link>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div className="grid gap-4">
                {sample.images.length ? (
                  sample.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={image.altText || sample.title}
                      className="w-full rounded-[2rem] object-cover"
                    />
                  ))
                ) : (
                  <div className="sample-art min-h-[520px] rounded-[2rem]">
                    <div className="sample-paper">
                      <span>{sample.tags[0] || "Sample"}</span>
                      <strong>{sample.title}</strong>
                      <small>{sample.category.name}</small>
                    </div>
                    <span className="sample-mark">SO</span>
                  </div>
                )}
              </div>
              <div>
                <p className="eyebrow">
                  {sample.category.name}
                  {sample.isFeatured ? " · Featured" : ""}
                </p>
                <h1 className="display mt-3 text-5xl md:text-6xl">
                  {sample.title}
                </h1>
                <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                  {sample.description}
                </p>
                <dl className="mt-7 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm">
                  <Detail label="Category" value={sample.category.name} />
                  <Detail label="Service" value={sample.service.name} />
                  <Detail label="Material" value={sample.material} />
                  <Detail label="Size" value={sample.size} />
                  {sample.tags.length > 0 && (
                    <div>
                      <dt className="font-semibold">Tags</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {sample.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-black/5 px-2.5 py-1 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="mt-7 flex flex-wrap gap-3">
                  <TrackedAnchor
                    event="request_similar"
                    metadata={{ sampleId: sample.id, slug: sample.slug }}
                    href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-5 py-3 font-semibold text-white"
                  >
                    <MessageCircle size={17} /> Request similar design
                  </TrackedAnchor>
                  <TrackedAnchor
                    event="phone_click"
                    metadata={{
                      location: "sample_detail",
                      sampleId: sample.id,
                    }}
                    href={`tel:${settings.phonePrimary?.replace(/\s/g, "")}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 font-semibold"
                  >
                    <Phone size={17} /> Call us
                  </TrackedAnchor>
                </div>
              </div>
            </div>
          </div>
        </section>
        {related.length > 0 && (
          <section className="border-t border-[var(--border)] bg-[var(--surface)] py-20">
            <div className="container-shell">
              <p className="eyebrow">More like this</p>
              <h2 className="display mt-3 text-4xl">Related samples.</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <SampleCard key={item.slug} sample={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      {/* <WhatsAppFab /> */}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd className="mt-1 text-[var(--muted)]">{value}</dd>
    </div>
  );
}
