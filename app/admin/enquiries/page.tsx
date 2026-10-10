export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import EnquiryStatusForm from "@/components/admin/EnquiryStatusForm";
import EnquiryEditor from "@/components/admin/EnquiryEditor";

export default async function AdminEnquiriesPage() {
  const [enquiries, services, samples] = await Promise.all([
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        sample: true,
      },
    }),

    prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.sample.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#6e665f]">Customer enquiries</p>

        <h1 className="mt-1 text-3xl font-semibold">Enquiries</h1>

        <p className="mt-2 text-sm text-[#6e665f]">
          Manage customer requirements, follow-ups and enquiry status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="divide-y divide-black/10">
          {enquiries.length ? (
            enquiries.map((item) => (
              <article key={item.id} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-semibold">{item.name}</h2>

                        <p className="mt-1 text-sm text-[#6e665f]">
                          {item.phone}

                          {item.email ? ` · ${item.email}` : ""}
                        </p>
                      </div>

                      <p className="text-xs text-[#6e665f]">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6e665f]">
                          Service
                        </p>

                        <p className="mt-1 text-sm">
                          {item.service?.name || "Custom requirement"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6e665f]">
                          Sample
                        </p>

                        <p className="mt-1 text-sm">
                          {item.sample?.title || "None"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6e665f]">
                          Preferred contact
                        </p>

                        <p className="mt-1 text-sm">
                          {item.preferredContact || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6e665f]">
                          Enquiry ID
                        </p>

                        <p className="mt-1 break-all text-xs text-[#6e665f]">
                          {item.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#fbf8f3] p-4">
                      <p className="whitespace-pre-wrap text-sm text-[#403a35]">
                        {item.message}
                      </p>
                    </div>

                    <EnquiryEditor
                      enquiry={{
                        id: item.id,
                        name: item.name,
                        phone: item.phone,
                        email: item.email,
                        message: item.message,
                        preferredContact: item.preferredContact,
                        status: item.status,
                        serviceId: item.serviceId,
                        sampleId: item.sampleId,
                      }}
                      services={services}
                      samples={samples}
                    />
                  </div>

                  <EnquiryStatusForm id={item.id} status={item.status} />
                </div>
              </article>
            ))
          ) : (
            <p className="p-8 text-sm text-[#6e665f]">No enquiries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
