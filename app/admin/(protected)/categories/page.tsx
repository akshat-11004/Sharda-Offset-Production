
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import CategoryManager from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireOwner();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { samples: true } } },
  });

  return (
    <div className="ad-page">
      <PageHeader title="Categories" description="Organize your portfolio by type of print work." />
      <CategoryManager initial={categories} />
    </div>
  );
}
