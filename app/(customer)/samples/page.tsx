// import { Navbar } from "@/components/customer/Navbar";
import { SampleGallery } from "@/components/customer/SampleGallery";
import { EnquiryCta } from "@/components/customer/EnquiryCta";
// import { WhatsAppFab } from "@/components/customer/WhatsAppFab";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SamplesPage() {
  const samples = await prisma.sample.findMany({
    where: { isActive: true },
    include: {
      category: true,
      service: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* <Navbar /> */}
      <main>
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-16">
          <div className="container-shell">
            <p className="eyebrow">Portfolio</p>
            <h1 className="display mt-3 max-w-3xl text-5xl md:text-6xl">
              Find a design direction you can make your own.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Search by service, category or style. When something catches your
              eye, request a similar design and continue the conversation with
              the shop.
            </p>
          </div>
        </section>
        <SampleGallery samples={samples} />
        <EnquiryCta />
      </main>
      {/* <WhatsAppFab /> */}
    </>
  );
}
