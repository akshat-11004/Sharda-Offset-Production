import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Hero } from "@/components/customer/Hero";
import { ServiceGrid } from "@/components/customer/ServiceGrid";
import { SampleCard } from "@/components/customer/SampleCard";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
import { getSiteSettings } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, latest, serviceRecords, settings] =
    await Promise.all([
      prisma.sample.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: true,
          service: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.sample.findMany({
        where: { isActive: true },
        include: {
          category: true,
          service: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          samples: {
            where: { isActive: true, images: { some: {} } },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
          },
        },
      }),
      getSiteSettings(),
    ]);
  const heroSamples = featured.length ? featured : latest;
  const categories = serviceRecords.map((service) => ({
    name: service.name,
    slug: service.slug,
    image: service.samples[0]?.images[0] || null,
  }));
  const latestUnique = latest.filter(
    (sample) => !featured.some((item) => item.id === sample.id),
  );
  const whatsappHref = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage || "Hello, I would like to enquire about printing.")}`;
  return (
    <main>
      <Hero samples={heroSamples} phone={settings.phonePrimary} />
      <section className="border-y border-[var(--border)] bg-white py-5">
        <div className="container-shell grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <span className="block text-xs text-[var(--muted)]">
              Local studio
            </span>
            <strong>Nadiad, Gujarat</strong>
          </div>
          <div>
            <span className="block text-xs text-[var(--muted)]">
              Personal support
            </span>
            <strong>Talk to the shop</strong>
          </div>
          <div>
            <span className="block text-xs text-[var(--muted)]">
              Easy enquiries
            </span>
            <strong>WhatsApp & phone</strong>
          </div>
          <div>
            <span className="block text-xs text-[var(--muted)]">
              Working hours
            </span>
            <strong>{settings.hours}</strong>
          </div>
        </div>
      </section>
      <ServiceGrid categories={categories} />
      {featured.length > 0 && (
        <section className="showcase-section py-16 sm:py-20 lg:py-28">
          <div className="container-shell">
            <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
              <div>
                <p className="eyebrow">Featured samples</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">
                  Print worth looking closer at.
                </h2>
              </div>
              <Link
                href="/samples"
                className="focus-ring hidden rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white sm:inline-flex"
              >
                Explore gallery <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
            <div className="featured-scroll">
              {featured.map((sample, index) => (
                <div
                  className={index === 0 ? "featured-lead" : ""}
                  key={sample.slug}
                >
                  <SampleCard sample={sample} compact={index !== 0} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {latestUnique.length > 0 && (
        <section className="overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20">
          <div className="container-shell">
            <div className="mb-8 flex items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Latest printed work</p>
                <h2 className="display mt-3 text-4xl">
                  Fresh from the studio.
                </h2>
              </div>
              <Link
                href="/samples"
                className="text-sm font-bold text-[var(--maroon)]"
              >
                See all
              </Link>
            </div>
            <div className="latest-strip">
              {latestUnique.map((sample) => (
                <SampleCard key={sample.slug} sample={sample} compact />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <p className="eyebrow">How it works</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Choose", "Find a product or idea."],
              ["02", "Customize", "Share your size and finish."],
              ["03", "Enquire", "Talk directly with our team."],
              ["04", "Print", "Approve and bring it to life."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-[var(--border)] bg-white p-5"
              >
                <span className="text-xs font-bold tracking-[.18em] text-[var(--gold)]">
                  {number}
                </span>
                <h3 className="mt-8 font-bold">{title}.</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10 sm:py-16">
        <div className="container-shell grid gap-6 rounded-[2rem] bg-[#ebddd0] p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:p-12">
          <div>
            <p className="eyebrow">About Sharda Offset</p>
            <h2 className="display mt-3 max-w-xl text-4xl sm:text-5xl">
              A local print partner for your important moments.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
              From single cards to full business stationery, we help turn a
              clear idea into something you can hold.
            </p>
            <Link
              href="/about"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold"
            >
              Our story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-2xl bg-[#f8f4ee] p-5">
              <Sparkles className="text-[var(--maroon)]" />
              <p className="mt-8 font-bold">Thoughtful design</p>
            </div>
            <div className="rounded-2xl bg-[var(--maroon)] p-5 text-white">
              <Check />
              <p className="mt-8 font-bold">Personal guidance</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 sm:py-16">
        <div className="container-shell grid gap-6 rounded-[2rem] border border-[var(--border)] bg-white p-7 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="eyebrow">Contact & enquiry</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              Let&apos;s print something together.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-5 py-3 text-sm font-bold text-white"
              >
                Send an enquiry <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappHref}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
          <div className="grid gap-4 text-sm">
            <p className="flex gap-3">
              <MapPin className="shrink-0 text-[var(--gold)]" size={18} />
              {settings.address}
            </p>
            <p className="flex gap-3">
              <Clock3 className="shrink-0 text-[var(--gold)]" size={18} />
              {settings.hours}
            </p>
            <a
              href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}
              className="flex gap-3 font-semibold"
            >
              <Phone className="shrink-0 text-[var(--gold)]" size={18} />
              {settings.phonePrimary}
            </a>
          </div>
        </div>
      </section>
      <EnquiryCta />
      <footer className="border-t border-[var(--border)] py-10">
        <div className="container-shell flex flex-col gap-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-[var(--foreground)]">
              {settings.businessName}
            </p>
            <p>Print · Design · Perfection</p>
          </div>
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
