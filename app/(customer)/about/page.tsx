import { Check, Sparkles } from "lucide-react";
// import { Navbar } from "@/components/customer/Navbar";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
// import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
export default function About() {
  return (
    <>
      {/* <Navbar /> */}
      <main>
        <section className="py-20 md:py-28">
          <div className="container-shell max-w-5xl">
            <p className="eyebrow">About Sharda Offset</p>
            <h1 className="display mt-4 text-5xl md:text-7xl">
              A local printing studio built around thoughtful service and
              beautiful output.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              Sharda Offset is presented online as a premium, approachable
              printing partner for personal celebrations, business stationery,
              signage and custom requirements in Nadiad.
            </p>
          </div>
        </section>
        <section className="bg-[var(--surface)] py-20">
          <div className="container-shell grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Quality",
                "A print should feel right in the hand, not just look good on a screen.",
              ],
              [
                "02",
                "Personal support",
                "Printing requirements are often specific. The experience should stay human and practical.",
              ],
              [
                "03",
                "Creative flexibility",
                "Use a sample as inspiration, then shape the final output around your own requirement.",
              ],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="rounded-[1.5rem] border border-[var(--border)] p-7"
              >
                <span className="text-xs font-semibold text-[var(--maroon)]">
                  {n}
                </span>
                <h2 className="mt-8 text-xl font-semibold">{t}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="py-20">
          <div className="container-shell grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">What the experience should feel like</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">
                Simple for customers. Useful for the shop.
              </h2>
            </div>
            <div className="space-y-3">
              {[
                "Find a relevant printing service quickly",
                "Browse real sample directions",
                "Ask questions without creating an account",
                "Move to WhatsApp, phone or enquiry when ready",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--background)]">
                    <Check size={15} />
                  </span>
                  <span className="text-sm font-medium">{x}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <EnquiryCta />
      </main>
      {/* <WhatsAppFab /> */}
    </>
  );
}
