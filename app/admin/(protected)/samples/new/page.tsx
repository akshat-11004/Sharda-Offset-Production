
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import SampleForm from "@/components/admin/SampleForm";
import { PageHeader } from "@/components/admin/AdminUI";

export default async function NewSamplePage() {
  await requireOwner();
  const [categories, services] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true, isActive: true } }),
  ]);
  return (
    <div className="ad-page">
      <PageHeader title="Add sample" back={{ href: "/admin/samples", label: "Samples" }} />
      <SampleForm categories={categories} services={services} />
    </div>
  );
}
