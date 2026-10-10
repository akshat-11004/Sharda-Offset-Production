import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/services"
          className="text-sm text-[#7d2635] hover:underline"
        >
          ← Back to services
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-[#272321]">
          Edit service
        </h1>

        <p className="mt-2 text-sm text-[#6e665f]">
          Update how this service appears on your website.
        </p>
      </div>

      <ServiceForm service={service} />
    </div>
  );
}
