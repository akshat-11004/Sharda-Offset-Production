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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await requireOwnerApi();

  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return NextResponse.json(
      { ok: false, error: "Service not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    service,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Service not found." },
        { status: 404 }
      );
    }

    const duplicate = await prisma.service.findFirst({
      where: {
        slug: body.slug,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          ok: false,
          error: "Another service already uses this slug.",
        },
        { status: 409 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      ok: true,
      service,
    });
  } catch (error) {
    console.error("Service update failed:", error);

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
      {
        ok: false,
        error: "Failed to update service.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const owner = await requireOwnerApi();

    if (!owner) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            samples: true,
            enquiries: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          ok: false,
          error: "Service not found.",
        },
        { status: 404 }
      );
    }

    if (service._count.samples > 0 || service._count.enquiries > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This service cannot be deleted because it is linked to samples or enquiries. Deactivate it instead.",
          samples: service._count.samples,
          enquiries: service._count.enquiries,
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Service deletion failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to delete service.",
      },
      { status: 500 }
    );
  }
}
