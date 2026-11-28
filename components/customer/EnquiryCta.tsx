"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { business } from "@/lib-data";
import { GlowingEffect } from "./interactions/GlowingEffect";
import { MagneticButton } from "./interactions/MagneticButton";

export function EnquiryCta({ sample = "", whatsapp = business.whatsapp }: { sample?: string; whatsapp?: string }) {
  const message = sample
    ? `Hello, I am interested in a design similar to: ${sample}. Please share details and pricing.`
    : "Hello, I would like to discuss a printing requirement.";

  return (
    <section className="py-16 sm:py-20">
      <div data-reveal data-spotlight className="enquiry-panel container-shell overflow-hidden rounded-[2rem] p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 className="display mt-3 max-w-2xl text-4xl md:text-5xl">Have a printing requirement? Let’s make it tangible.</h2>
            <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">Share your quantity, format, reference or idea. The shop can guide you on the next step.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--maroon)] px-5 py-3 text-sm font-semibold text-white">
              <MagneticButton>Send enquiry <ArrowRight size={16} /></MagneticButton>
            </Link>
            <a
              onClick={() => trackEvent({ event: "whatsapp_click", metadata: { location: "enquiry_cta" } })}
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold"
            >
              <MagneticButton><MessageCircle size={16} /> WhatsApp</MagneticButton>
            </a>
          </div>
        </div>
        <GlowingEffect />
      </div>
    </section>
  );
}