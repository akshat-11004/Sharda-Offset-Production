import { prisma } from "@/lib/prisma";
import SampleForm from "@/components/admin/SampleForm";
export default async function NewSamplePage() {
  const [categories, services] = await Promise.all([
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
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-[#6e665f]">Portfolio management</p>
        <h1 className="mt-1 text-3xl font-semibold">Add sample</h1>
      </div>
      <SampleForm categories={categories} services={services} />
    </div>
  );
}
