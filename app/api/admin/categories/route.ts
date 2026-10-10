import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
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

export async function GET() {
  await requireOwner();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          samples: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    categories,
  });
}

export async function POST(request: Request) {
  try {
    await requireOwner();

    const body = schema.parse(await request.json());

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        category,
      },
      { status: 201 }
    );
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

    console.error("Create category failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create category. Slug may already exist.",
      },
      { status: 500 }
    );
  }
}
