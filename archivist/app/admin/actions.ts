"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUserId } from "@/lib/admin";
import type { UserStatus } from "@prisma/client";
import { isValidProductType } from "@/app/library/productValidation";

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

export async function addProductType(formData: FormData) {
  await requireAdmin();
  const rawName = formData.get("name");

  if (typeof rawName !== "string") {
    redirect("/admin?tab=types&message=invalid-type");
  }

  const name = rawName.trim();
  if (!name || !isValidProductType(name)) {
    redirect("/admin?tab=types&message=invalid-type");
  }

  try {
    await prisma.productType.create({ data: { name } });
  } catch (error) {
    redirect("/admin?tab=types&message=type-exists");
  }

  revalidatePath("/admin");
  redirect("/admin?tab=types&message=type-added");
}

export async function removeProductType(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("typeId");

  if (typeof rawId !== "string") {
    redirect("/admin?tab=types&message=invalid-type");
  }

  const type = await prisma.productType.findUnique({
    where: { id: rawId },
    select: { name: true },
  });

  if (!type) {
    redirect("/admin?tab=types&message=invalid-type");
  }

  const inUse = await prisma.product.count({
    where: { type: type.name },
  });

  if (inUse > 0) {
    redirect("/admin?tab=types&message=type-in-use");
  }

  await prisma.productType.delete({ where: { id: rawId } });

  revalidatePath("/admin");
  redirect("/admin?tab=types&message=type-removed");
}
