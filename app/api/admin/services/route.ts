import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens."
    ),
  description: z.string().trim().min(5).max(2000),
  shortText: z.string().trim().max(300).optional(),
  image: z.string().trim().max(500).optional(),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0),
});

export async function GET() {
  const owner = await requireOwnerApi();

  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const services = await prisma.service.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    services,
  });
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwnerApi();

    if (!owner) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = schema.parse(await request.json());

    const existing = await prisma.service.findUnique({
      where: { slug: body.slug },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "A service with this slug already exists." },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: body,
    });

    return NextResponse.json({ ok: true, service }, { status: 201 });
  } catch (error) {
    console.error("Service creation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please check the entered values.",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create service." },
      { status: 500 }
    );
  }
}
