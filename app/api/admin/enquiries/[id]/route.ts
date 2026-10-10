import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(100),

  phone: z.string().trim().min(9, "Phone number is required.").max(30),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .max(150)
    .nullable()
    .optional(),

  message: z.string().trim().min(5, "Message is required.").max(3000),

  preferredContact: z
    .enum(["PHONE", "WHATSAPP", "EMAIL"])
    .nullable()
    .optional(),

  serviceId: z.string().trim().nullable().optional(),

  sampleId: z.string().trim().nullable().optional(),

  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUOTATION_SENT",
    "IN_PROGRESS",
    "CONVERTED",
    "CLOSED",
    "NOT_INTERESTED",
  ]),
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

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enquiry not found.",
        },
        { status: 404 }
      );
    }

    if (body.serviceId) {
      const service = await prisma.service.findUnique({
        where: {
          id: body.serviceId,
        },
        select: {
          id: true,
        },
      });

      if (!service) {
        return NextResponse.json(
          {
            ok: false,
            error: "Selected service was not found.",
          },
          { status: 400 }
        );
      }
    }

    if (body.sampleId) {
      const sample = await prisma.sample.findUnique({
        where: {
          id: body.sampleId,
        },
        select: {
          id: true,
        },
      });

      if (!sample) {
        return NextResponse.json(
          {
            ok: false,
            error: "Selected sample was not found.",
          },
          { status: 400 }
        );
      }
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },

      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        message: body.message,
        preferredContact: body.preferredContact || null,
        status: body.status,

        serviceId: body.serviceId || null,
        sampleId: body.sampleId || null,
      },

      include: {
        service: true,
        sample: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");

    return NextResponse.json({
      ok: true,
      enquiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid enquiry information.",
        },
        { status: 400 }
      );
    }

    console.error("Update enquiry failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update enquiry.",
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

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enquiry not found.",
        },
        { status: 404 }
      );
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Delete enquiry failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to delete enquiry.",
      },
      { status: 500 }
    );
  }
}
