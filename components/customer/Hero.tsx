import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { business } from "@/lib-data";
export function Hero() {
  const whatsapp = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent("Hello, I found Sharda Offset online and would like to know more about your printing services.")}`;
  return (
    <section className="overflow-hidden py-16 md:py-24">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
        <div>
          <p className="eyebrow">Premium local printing studio • Nadiad</p>
          <h1 className="display mt-5 max-w-3xl text-5xl leading-[.95] sm:text-6xl lg:text-7xl">
            Beautiful printing.
            <br />
            <span className="text-[var(--maroon)]">
              Made for every occasion.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            From wedding invitations and visiting cards to business stationery,
            banners and custom printing — we turn your ideas into beautiful
            printed products.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/samples"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 font-medium text-white"
            >
              Explore our work <ArrowRight size={17} />
            </Link>
            <a
              href={whatsapp}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-medium"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
            <a
              href={`tel:${business.phones[0].replace(/\s/g, "")}`}
              className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium text-[var(--maroon)]"
            >
              <Phone size={17} /> Call us
            </a>
          </div>
          <p className="mt-5 text-xs text-[var(--muted)]">
            Serving Nadiad with personalized printing support.
          </p>
        </div>
        <div className="hero-art relative min-h-[430px] overflow-hidden rounded-[2rem] border border-[var(--border)] p-4 shadow-[0_25px_80px_rgba(33,30,27,.10)]">
          <div className="absolute inset-4 rounded-[1.5rem] border border-white/60 bg-[linear-gradient(135deg,#f8f0e4,#ddc5ab_52%,#8d5d50)]" />
          <div className="absolute left-[8%] top-[9%] w-[62%] rotate-[-5deg] rounded-xl bg-[#fffdf9] p-7 shadow-2xl">
            <div className="border border-[#d6bf96] p-8 text-center">
              <p className="text-xs uppercase tracking-[.3em] text-[#987341]">
                A celebration of
              </p>
              <h2 className="display mt-5 text-4xl">Togetherness</h2>
              <p className="mt-3 text-xs tracking-[.2em] text-[var(--muted)]">
                INVITATION • DESIGN • PRINT
              </p>
            </div>
          </div>
          <div className="absolute bottom-[8%] right-[7%] w-[46%] rotate-[7deg] rounded-xl bg-[#211e1b] p-6 text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[.25em] text-[#d9bd82]">
              Print beautifully
            </p>
            <p className="display mt-3 text-3xl">Make it memorable.</p>
          </div>
          <div className="absolute bottom-5 left-7 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] backdrop-blur">
            Crafted locally
          </div>
        </div>
      </div>
    </section>
  );
}
