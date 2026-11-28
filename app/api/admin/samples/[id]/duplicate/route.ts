import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireOwnerApi())) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const source = await prisma.sample.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!source) {
      return NextResponse.json({ ok: false, error: "Sample not found. Refresh the samples list." }, { status: 404 });
    }

    const baseSlug = `${source.slug}-copy`;
    for (let number = 1; ; number++) {
      const slug = number === 1 ? baseSlug : `${baseSlug}-${number}`;
      if (await prisma.sample.findUnique({ where: { slug }, select: { id: true } })) continue;

      try {
        const sample = await prisma.sample.create({
          data: {
            title: `${source.title} Copy`,
            slug,
            description: source.description,
            category: { connect: { id: source.categoryId } },
            service: { connect: { id: source.serviceId } },
            material: source.material,
            size: source.size,
            tags: source.tags,
            isFeatured: false,
            isActive: false,
            images: {
              create: source.images.map((image, index) => ({
                url: image.url,
                sortOrder: index,
                altText: image.altText,
              })),
            },
          },
          include: {
            category: true,
            service: true,
            images: { orderBy: { sortOrder: "asc" } },
          },
        });

        return NextResponse.json({ ok: true, sample }, { status: 201 });
      } catch (error) {
        // Another request can claim the slug after the lookup.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" &&
            Array.isArray(error.meta?.target) && error.meta.target.includes("slug")) {
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("DUPLICATE SAMPLE ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Could not duplicate the sample. Please try again." },
      { status: 500 }
    );
  }
}
