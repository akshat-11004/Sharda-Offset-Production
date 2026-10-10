import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens."
    ),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const owner = await requireOwnerApi();

    if (!owner) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = schema.parse(await request.json());

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/samples");

    return NextResponse.json({
      ok: true,
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid category.",
        },
        { status: 400 }
      );
    }

    console.error("Update category failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update category. Slug may already exist.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const owner = await requireOwnerApi();

    if (!owner) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            samples: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          ok: false,
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    if (category._count.samples > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This category cannot be deleted because samples are using it. Move or delete those samples first.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/samples");

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Delete category failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}
