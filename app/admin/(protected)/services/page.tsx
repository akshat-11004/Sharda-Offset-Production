import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#6e665f]">Website content</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#272321]">
            Services
          </h1>

          <p className="mt-2 text-sm text-[#6e665f]">
            Manage the printing services shown on your website.
          </p>
        </div>

        <Link
          href="/admin/services/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#7d2635] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#67202d]"
        >
          Add service
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm">
        <div className="divide-y divide-[#eee6dd]">
          {services.length === 0 ? (
            <div className="p-6 text-sm text-[#6e665f]">No services found.</div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#272321]">
                      {service.name}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        service.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#8a8179]">
                    /services/{service.slug} · Order {service.displayOrder}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-[#6e665f]">
                    {service.description}
                  </p>
                </div>

                <Link
                  href={`/admin/services/${service.id}`}
                  className="shrink-0 rounded-xl border border-[#dcd2c7] px-4 py-2.5 text-center text-sm font-medium text-[#403a35] hover:bg-[#f6f1e9]"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
