"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidShelfName } from "@/app/library/shelfValidation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 60;
const PASSWORD_MIN = 8;

function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= NAME_MIN && trimmed.length <= NAME_MAX;
}

export async function updateAccount(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawName = formData.get("name");
  const rawEmail = formData.get("email");

  if (typeof rawName !== "string" || typeof rawEmail !== "string") {
    redirect("/settings?status=account-missing");
  }

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();

  if (!name || !email) {
    redirect("/settings?status=account-missing");
  }

  if (!isValidName(name)) {
    redirect("/settings?status=account-invalid");
  }

  if (!emailPattern.test(email)) {
    redirect("/settings?status=account-email");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.email !== email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      redirect("/settings?status=account-duplicate");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, email },
  });

  redirect("/settings?status=account-updated");
}

export async function updateLibrary(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawName = formData.get("libraryName");

  if (typeof rawName !== "string") {
    redirect("/settings?status=library-missing");
  }

  const name = rawName.trim();

  if (!name) {
    redirect("/settings?status=library-missing");
  }

  if (!isValidShelfName(name)) {
    redirect("/settings?status=library-invalid");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!library) {
    redirect("/settings?status=library-notfound");
  }

  await prisma.library.update({
    where: { id: library.id },
    data: { name },
  });

  redirect("/settings?status=library-updated");
}

export async function updatePreferences(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const showShelfPulse = formData.get("showShelfPulse") === "on";

  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, showShelfPulse },
    update: { showShelfPulse },
  });

  redirect("/settings?status=prefs-updated");
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawCurrent = formData.get("currentPassword");
  const rawNext = formData.get("newPassword");
  const rawConfirm = formData.get("confirmPassword");

  if (
    typeof rawCurrent !== "string" ||
    typeof rawNext !== "string" ||
    typeof rawConfirm !== "string"
  ) {
    redirect("/settings?status=password-missing");
  }

  const currentPassword = rawCurrent.trim();
  const newPassword = rawNext.trim();
  const confirmPassword = rawConfirm.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/settings?status=password-missing");
  }

  if (newPassword.length < PASSWORD_MIN) {
    redirect("/settings?status=password-invalid");
  }

  if (newPassword !== confirmPassword) {
    redirect("/settings?status=password-mismatch");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user?.password) {
    redirect("/settings?status=password-invalid");
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    redirect("/settings?status=password-incorrect");
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  redirect("/settings?status=password-updated");
}
