import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SampleForm from "@/components/admin/SampleForm";
export const dynamic = "force-dynamic";
export default async function EditSamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [sample, categories, services] = await Promise.all([
    prisma.sample.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!sample) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-[#6e665f]">Portfolio management</p>
        <h1 className="mt-1 text-3xl font-semibold">Edit sample</h1>
        <p className="mt-2 text-sm text-[#6e665f]">{sample.title}</p>
      </div>
      <SampleForm sample={sample} categories={categories} services={services} />
    </div>
  );
}
