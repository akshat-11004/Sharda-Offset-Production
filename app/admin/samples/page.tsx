import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SampleActions from "@/components/admin/SampleActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSamplesPage() {
  const samples = await prisma.sample.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      category: true,
      service: true,

      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#6e665f]">Portfolio management</p>

          <h1 className="mt-1 text-3xl font-semibold">Samples</h1>

          <p className="mt-2 text-sm text-[#6e665f]">
            Add, edit, feature, hide and duplicate portfolio samples.
          </p>
        </div>

        <Link
          href="/admin/samples/new"
          className="w-fit rounded-xl bg-[#7a1f2b] px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Add sample
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {samples.map((sample) => {
          const firstImage = sample.images[0];

          return (
            <article
              key={sample.id}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
            >
              {firstImage ? (
                <img
                  src={firstImage.url}
                  alt={sample.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-[#f6f1e9] text-sm text-[#6e665f]">
                  No image
                </div>
              )}

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{sample.title}</h2>

                    <p className="mt-1 text-xs text-[#6e665f]">
                      {sample.category.name}
                      {sample.service ? ` · ${sample.service.name}` : ""}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      sample.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-black/5 text-[#6e665f]"
                    }`}
                  >
                    {sample.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sample.isFeatured && (
                    <span className="rounded-full bg-[#f6f1e9] px-2.5 py-1 text-xs font-semibold text-[#7a1f2b]">
                      Featured
                    </span>
                  )}

                  {sample.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/5 px-2 py-1 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <SampleActions
                  id={sample.id}
                  active={sample.isActive}
                  featured={sample.isFeatured}
                />
              </div>
            </article>
          );
        })}
      </div>

      {!samples.length && (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-[#6e665f]">
          No samples yet. Add your first portfolio item.
        </div>
      )}
    </div>
  );
}
