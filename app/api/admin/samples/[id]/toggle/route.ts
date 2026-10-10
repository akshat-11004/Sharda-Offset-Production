import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/require-owner";
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
    await requireOwner();

    const { id } = await params;

    const body = schema.parse(await request.json());

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
    console.error("TOGGLE SAMPLE ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid request.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to update sample.",
      },
      { status: 500 }
    );
  }
}
