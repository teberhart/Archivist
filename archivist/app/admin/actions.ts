"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUserId } from "@/lib/admin";
import type { UserStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  if (!(await isAdminUserId(userId))) {
    redirect("/");
  }

  return { userId };
}

function parseStatus(value: FormDataEntryValue | null): UserStatus | null {
  if (typeof value !== "string") {
    return null;
  }
  if (value === "VIP" || value === "STANDARD") {
    return value;
  }
  return null;
}

export async function updateUserStatus(formData: FormData) {
  const { userId: adminId } = await requireAdmin();
  const targetId = formData.get("userId");
  const nextStatus = parseStatus(formData.get("status"));

  if (typeof targetId !== "string" || !nextStatus) {
    redirect("/admin?message=invalid-action");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { status: true },
  });

  if (!target) {
    redirect("/admin?message=invalid-action");
  }

  if (target.status === "ADMIN") {
    redirect("/admin?message=protected-user");
  }

  await prisma.user.update({
    where: { id: targetId },
    data: { status: nextStatus },
  });

  revalidatePath("/admin");
  redirect(`/admin?message=${nextStatus === "VIP" ? "vip-enabled" : "vip-disabled"}`);
}

export async function deleteUser(formData: FormData) {
  const { userId: adminId } = await requireAdmin();
  const targetId = formData.get("userId");

  if (typeof targetId !== "string") {
    redirect("/admin?message=invalid-action");
  }

  if (targetId === adminId) {
    redirect("/admin?message=delete-self");
  }

  await prisma.user.delete({
    where: { id: targetId },
  });

  revalidatePath("/admin");
  redirect("/admin?message=user-deleted");
}
