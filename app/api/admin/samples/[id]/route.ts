import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const sampleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().default(""),
  categoryId: z.string().min(1, "Category is required"),
  serviceId: z.string().min(1, "Service is required"),
  material: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  imageUrls: z.array(z.string().trim().min(1)).default([]),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = sampleSchema.parse(await request.json());

    const sample = await prisma.$transaction(async (tx) => {
      // Remove existing sample images.
      await tx.sampleImage.deleteMany({
        where: { sampleId: id },
      });

      // Update the sample using the actual Prisma schema.
      return tx.sample.update({
        where: { id },
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,

          material: body.material ?? null,
          size: body.size ?? null,
          tags: body.tags,

          isFeatured: body.featured,
          isActive: body.active,

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
    });

    return NextResponse.json({
      success: true,
      sample,
    });
  } catch (error) {
    console.error("UPDATE SAMPLE ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid sample data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update sample",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.sample.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE SAMPLE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete sample",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
