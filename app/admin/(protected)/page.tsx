import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
  const [enquiries, newEnquiries, samples, services] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.sample.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: true } }),
  ]);
  const recent = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { service: true, sample: true },
  });
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-[#6e665f]">Business overview</p>
        <h1 className="mt-1 text-3xl font-semibold">Owner dashboard</h1>
        <p className="mt-2 text-sm text-[#6e665f]">
          Manage customer demand and your printing portfolio.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total enquiries", enquiries],
          ["New enquiries", newEnquiries],
          ["Active samples", samples],
          ["Active services", services],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-[#6e665f]">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <h2 className="font-semibold">Recent enquiries</h2>
            <p className="text-sm text-[#6e665f]">
              Latest customer requirements.
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-sm font-semibold text-[#7a1f2b]"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-black/10">
          {recent.length ? (
            recent.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 px-6 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-[#6e665f]">
                    {item.phone}
                    {item.email ? ` · ${item.email}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm">
                    {item.service?.name || "Custom requirement"}
                  </p>
                  <p className="text-xs text-[#6e665f]">
                    {item.sample?.title || "No sample selected"}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#f6f1e9] px-3 py-1 text-xs font-semibold">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
            ))
          ) : (
            <p className="px-6 py-8 text-sm text-[#6e665f]">
              No enquiries yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
