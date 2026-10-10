import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();

    const { id } = await params;

    const source = await prisma.sample.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { ok: false, error: "Sample not found." },
        { status: 404 }
      );
    }

    // Create a unique slug for the copy.
    const baseSlug = `${source.slug}-copy`;

    let slug = baseSlug;
    let number = 2;

    while (await prisma.sample.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${number}`;
      number++;
    }

    const copy = await prisma.sample.create({
      data: {
        title: `${source.title} Copy`,
        slug,
        description: source.description,

        // Relations
        category: {
          connect: {
            id: source.categoryId,
          },
        },

        service: {
          connect: {
            id: source.serviceId,
          },
        },

        // Current Sample fields
        material: source.material,
        size: source.size,
        tags: source.tags,

        // A duplicated sample starts hidden
        // and not featured.
        isFeatured: false,
        isActive: false,

        // Copy all images
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
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        sample: copy,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DUPLICATE SAMPLE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to duplicate sample.",
      },
      { status: 500 }
    );
  }
}
