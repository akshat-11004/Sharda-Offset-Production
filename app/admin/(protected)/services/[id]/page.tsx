
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import ServiceForm from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/AdminUI";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="ad-page">
      <PageHeader title="Edit service" description={service.name} back={{ href: "/admin/services", label: "Services" }} />
      <ServiceForm service={service} />
    </div>
  );
}
