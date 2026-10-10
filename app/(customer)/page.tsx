import { getSiteSettings } from "@/lib/site-settings";
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
// import Navbar from "@/components/customer/Navbar";
import { Hero } from "@/components/customer/Hero";
import { ServiceGrid } from "@/components/customer/ServiceGrid";
import { SampleCard } from "@/components/customer/SampleCard";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
// import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
import { business, faqs } from "@/lib-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function Home() {
  const featuredSamples = await prisma.sample.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      category: true,
      service: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  const settings = await getSiteSettings();
  return (
    <>
      {/* <Navbar
        businessName={settings.businessName}
        phonePrimary={settings.phonePrimary ?? ""}
        whatsapp={settings.whatsapp}
        whatsappMessage={settings.whatsappMessage ?? ""}
      /> */}
      <main>
        <Hero />
        <section className="border-y border-[var(--border)] bg-[var(--surface)] py-7">
          <div className="container-shell grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Local studio</p>
              <p className="mt-1 font-semibold">Nadiad, Gujarat</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Personal support</p>
              <p className="mt-1 font-semibold">Talk directly to the shop</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Response</p>
              <p className="mt-1 font-semibold">WhatsApp & phone</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Hours</p>
              <p className="mt-1 font-semibold">{settings.hours}</p>
            </div>
          </div>
        </section>
        <ServiceGrid />
        {featuredSamples.length > 0 && (
          <section className="bg-[#efe7dc] py-24">
            <div className="container-shell">
              <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow">Selected work</p>
                  <h2 className="display mt-3 text-4xl md:text-5xl">
                    Explore ideas before you decide.
                  </h2>
                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    Browse a few development samples for direction. The gallery
                    is designed to grow with the shop’s real portfolio.
                  </p>
                </div>
                <Link
                  href="/samples"
                  className="focus-ring inline-flex w-fit items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
                >
                  See all samples <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {featuredSamples.map((s) => (
                  <SampleCard key={s.slug} sample={s} compact />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="py-24">
          <div className="container-shell grid gap-14 lg:grid-cols-2">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">
                From inspiration to print, without the runaround.
              </h2>
              <div className="mt-9 space-y-6">
                {[
                  ["01", "Explore", "Browse services and samples."],
                  [
                    "02",
                    "Choose",
                    "Find a design direction or describe what you need.",
                  ],
                  [
                    "03",
                    "Enquire",
                    "Send your requirements through WhatsApp or the website.",
                  ],
                  [
                    "04",
                    "Print",
                    "The team confirms the details and starts production.",
                  ],
                ].map(([n, t, d]) => (
                  <div key={n} className="flex gap-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] text-xs font-semibold">
                      {n}
                    </span>
                    <div>
                      <h3 className="font-semibold">{t}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
              <p className="eyebrow">Why choose us</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  "Premium Quality",
                  "Experienced Team",
                  "Custom Designs",
                  "Fast Response",
                  "Competitive Pricing",
                  "Reliable Service",
                  "Bulk Orders",
                  "Personalized Support",
                ].map((x) => (
                  <div
                    key={x}
                    className="flex items-center gap-3 rounded-xl bg-[var(--background)] p-4"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-white">
                      <Check size={15} />
                    </span>
                    <span className="text-sm font-medium">{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[var(--surface)] py-24">
          <div className="container-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Frequently asked</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">
                Questions, answered simply.
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)] rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] px-6">
              {faqs.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 font-semibold marker:hidden">
                    {q}
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="py-24">
          <div className="container-shell grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-[2rem] bg-[var(--foreground)] p-8 text-white md:p-12">
              <p className="eyebrow text-[#d9bd82]">Find the shop</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">
                Let’s talk about what you want to print.
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <MapPin className="mt-1 shrink-0 text-[#d9bd82]" size={18} />
                  <p className="text-sm leading-6 text-white/75">
                    {settings.address}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-1 shrink-0 text-[#d9bd82]" size={18} />
                  <p className="text-sm leading-6 text-white/75">
                    {settings.hours}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="focus-ring rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
                >
                  Contact the shop
                </Link>
                <a
                  href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold"
                >
                  <Phone size={16} /> Call
                </a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8">
              <p className="eyebrow">Direct contact</p>
              <h3 className="display mt-3 text-3xl">Prefer a quick message?</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                WhatsApp is ideal for sharing references, quantities and
                questions.
              </p>
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessage || "Hello, I would like to enquire about printing.")}`}
                className="focus-ring mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--maroon)] px-5 py-3 font-semibold text-white"
              >
                <MessageCircle size={17} /> Chat on WhatsApp
              </a>
              <div className="mt-6 grid gap-2 text-sm text-[var(--muted)]">
                <a
                  href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}
                  className="hover:text-[var(--foreground)]"
                >
                  {settings.phonePrimary}
                </a>
                <a
                  href={`tel:${settings.phoneSecondary?.replace(/\s/g, "")}`}
                  className="hover:text-[var(--foreground)]"
                >
                  {settings.phoneSecondary}
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-[var(--foreground)]"
                >
                  {settings.email}
                </a>
              </div>
            </div>
          </div>
        </section>
        <EnquiryCta />
      </main>
      {/* <WhatsAppFab
        businessName={settings.businessName}
        whatsapp={settings.whatsapp}
        whatsappMessage={settings.whatsappMessage ?? ""}
      /> */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="container-shell flex flex-col gap-5 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {settings.businessName}
            </p>
            <p className="mt-1">Print • Design • Create</p>
          </div>
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
