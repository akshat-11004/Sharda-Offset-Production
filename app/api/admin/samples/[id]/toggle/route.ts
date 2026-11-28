import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";
import { z } from "zod";

const schema = z.object({
  field: z.enum(["active", "featured"]),
  value: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireOwnerApi())) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = schema.parse(await request.json().catch(() => null));

    const data =
      body.field === "active"
        ? { isActive: body.value }
        : { isFeatured: body.value };

    const sample = await prisma.sample.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ok: true,
      sample,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid request.",
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Sample not found. Refresh the samples list." }, { status: 404 });
    }

    console.error("TOGGLE SAMPLE ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not update the sample. Please try again.",
      },
      { status: 500 }
    );
  }
}
