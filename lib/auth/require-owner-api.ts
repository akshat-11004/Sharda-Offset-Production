import { prisma } from "@/lib/prisma";
import { getOwnerId } from "./session";

export async function requireOwnerApi() {
  const userId = await getOwnerId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== "OWNER") {
    return null;
  }

  return user;
}
