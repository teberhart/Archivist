import { prisma } from "@/lib/prisma";

export async function isAdminUserId(userId?: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  return user?.status === "ADMIN";
}
