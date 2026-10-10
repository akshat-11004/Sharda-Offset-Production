import EnquiryForm from "@/components/customer/EnquiryForm";
import { prisma } from "@/lib/prisma";
import { Mail, MapPin, Phone, Clock3 } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Contact() {
  const settings = await getSiteSettings();

  const [services, samples] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.sample.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  const phoneNumbers = [settings.phonePrimary, settings.phoneSecondary]
    .filter(Boolean)
    .join(" · ");

  return (
    <main>
      <section className="py-16 md:py-24">
        <div className="container-shell">
          <p className="eyebrow">Contact</p>

          <h1 className="display mt-3 max-w-3xl text-5xl md:text-6xl">
            Tell us what you want to print.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Share the basics and the shop can follow up with the right
            questions.
          </p>

          <div className="mt-12 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--background)]">
                    <MapPin size={18} />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted)]">
                      Address
                    </p>

                    <p className="mt-2 text-sm leading-6">{settings.address}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--background)]">
                    <Phone size={18} />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted)]">
                      Phone
                    </p>

                    <p className="mt-2 text-sm leading-6">{phoneNumbers}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--background)]">
                    <Mail size={18} />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted)]">
                      Email
                    </p>

                    <p className="mt-2 text-sm leading-6">{settings.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--background)]">
                    <Clock3 size={18} />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--muted)]">
                      Hours
                    </p>

                    <p className="mt-2 text-sm leading-6">{settings.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            <EnquiryForm services={services} samples={samples} />
          </div>
        </div>
      </section>
    </main>
  );
}
