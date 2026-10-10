import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/auth/require-owner-api";
import { z } from "zod";

const schema = z.object({
  businessName: z.string().trim().min(2).max(150),
  logoUrl: z.string().trim().max(500).optional(),
  address: z.string().trim().min(5).max(500),
  phonePrimary: z.string().trim().min(5).max(30),
  phoneSecondary: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().min(5).max(30),
  email: z.string().trim().email(),
  hours: z.string().trim().min(2).max(100),
  whatsappMessage: z.string().trim().max(500).optional(),
});

export async function GET() {
  const owner = await requireOwnerApi();

  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let settings = await prisma.siteSetting.findFirst();

  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: {
        businessName: "Sharda Offset",
        logoUrl: "",
        address:
          "5, Priti Complex, Santram Road, Opp. Riddhi Laboratory, Nadiad, Gujarat",
        phonePrimary: "+91 9825405898",
        phoneSecondary: "+91 8866600582",
        whatsapp: "+919825405898",
        email: "shardaoffset@gmail.com",
        hours: "9:00 AM - 7:00 PM",
        whatsappMessage:
          "Hello Sharda Offset, I would like to know more about your printing services.",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    settings,
  });
}

export async function PUT(request: Request) {
  try {
    const owner = await requireOwnerApi();

    if (!owner) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = schema.parse(await request.json());

    const existing = await prisma.siteSetting.findFirst();

    const settings = existing
      ? await prisma.siteSetting.update({
          where: { id: existing.id },
          data: body,
        })
      : await prisma.siteSetting.create({
          data: body,
        });

    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch (error) {
    console.error("Settings update failed:", error);

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
        error: "Failed to update settings.",
      },
      { status: 500 }
    );
  }
}
