import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";
export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { samples: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#6e665f]">Portfolio management</p>
        <h1 className="mt-1 text-3xl font-semibold">Categories</h1>
        <p className="mt-2 text-sm text-[#6e665f]">
          Organize samples so customers can discover the right printing work.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </div>
  );
}
