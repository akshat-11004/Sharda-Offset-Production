import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { business } from "@/lib-data";
import { StaticHeroArtwork } from "@/components/customer/visuals/StaticHeroArtwork";

export function Hero() {
  const whatsapp = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent("Hello, I found Sharda Offset online and would like to know more about your printing services.")}`;
  return (
    <section className="paper-background overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
        <div>
          <p className="eyebrow">Premium local printing studio · Nadiad</p>
          <h1 className="display mt-5 max-w-3xl text-[clamp(3.4rem,7vw,6.8rem)]">
            Your Ideas.<br /><span className="text-[var(--maroon)]">Beautifully Printed.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            From timeless wedding invitations to powerful business branding, we transform ideas into exceptional printed experiences.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/samples" className="premium-button focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 font-medium text-white">Explore our work <ArrowRight size={17} /></Link>
            <a href={whatsapp} className="premium-button focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-medium"><MessageCircle size={17} /> Chat on WhatsApp</a>
            <a href={`tel:${business.phones[0].replace(/\s/g, "")}`} className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium text-[var(--maroon)]"><Phone size={17} /> Call us</a>
          </div>
          <p className="mt-5 text-xs text-[var(--muted)]">Serving Nadiad with personalized printing support.</p>
        </div>
        <StaticHeroArtwork />
      </div>
    </section>
  );
}
