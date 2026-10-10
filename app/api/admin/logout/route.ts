import { NextResponse } from "next/server";
import { clearOwnerSession } from "@/lib/auth/session";

export async function POST() {
  await clearOwnerSession();

  const response = NextResponse.json({ ok: true });

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  return response;
}
