
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import SampleForm from "@/components/admin/SampleForm";
import { PageHeader } from "@/components/admin/AdminUI";

export default async function EditSamplePage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const [sample, categories, activeServices] = await Promise.all([
    prisma.sample.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, service: { select: { id: true, name: true, isActive: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true, isActive: true } }),
  ]);
  if (!sample) notFound();
  const services = activeServices.some(({ id }) => id === sample.serviceId) ? activeServices : [...activeServices, sample.service];
  return (
    <div className="ad-page">
      <PageHeader title="Edit sample" description={sample.title} back={{ href: "/admin/samples", label: "Samples" }} />
      <SampleForm sample={sample} categories={categories} services={services} />
    </div>
  );
}
