import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(2).max(160),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  description: z.string().trim().max(5000).default(""),

  categoryId: z.string().min(1),

  serviceId: z.string().min(1),

  material: z.string().trim().max(200).optional().nullable(),

  size: z.string().trim().max(200).optional().nullable(),

  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),

  featured: z.boolean().default(false),

  active: z.boolean().default(true),

  imageUrls: z.array(z.string().trim().min(1)).max(20).default([]),
});

export const dynamic = "force-dynamic";

export async function GET() {
  await requireOwner();

  const samples = await prisma.sample.findMany({
    orderBy: { createdAt: "desc" },

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

  return NextResponse.json({
    ok: true,
    samples,
  });
}

export async function POST(request: Request) {
  try {
    await requireOwner();

    const body = schema.parse(await request.json());

    const sample = await prisma.sample.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,

        category: {
          connect: {
            id: body.categoryId,
          },
        },

        service: {
          connect: {
            id: body.serviceId,
          },
        },

        material: body.material || null,
        size: body.size || null,

        tags: body.tags,

        isFeatured: body.featured,
        isActive: body.active,

        images: {
          create: body.imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },

      include: {
        category: true,
        service: true,
        images: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        sample,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE SAMPLE ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid sample.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to create sample.",
      },
      { status: 500 }
    );
  }
}
