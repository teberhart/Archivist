"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidShelfName } from "@/app/library/shelfValidation";

export async function createShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawName = formData.get("name");
  if (typeof rawName !== "string") {
    redirect("/library/add-shelf?status=missing");
  }

  const name = rawName.trim();
  if (!name) {
    redirect("/library/add-shelf?status=missing");
  }
  if (!isValidShelfName(name)) {
    redirect("/library/add-shelf?status=invalid");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library/add-shelf?status=nolibrary");
  }

  const existing = await prisma.shelf.findFirst({
    where: {
      libraryId: library.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    redirect("/library/add-shelf?status=duplicate");
  }

  await prisma.shelf.create({
    data: {
      name,
      libraryId: library.id,
    },
  });

  revalidatePath("/library");
  redirect("/library?status=created");
}

export async function deleteShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawId = formData.get("shelfId");
  if (typeof rawId !== "string") {
    redirect("/library?status=delete-missing");
  }

  const shelfId = rawId.trim();
  if (!shelfId) {
    redirect("/library?status=delete-missing");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const shelf = await prisma.shelf.findFirst({
    where: {
      id: shelfId,
      libraryId: library.id,
    },
  });

  if (!shelf) {
    redirect("/library?status=delete-missing");
  }

  await prisma.shelf.delete({
    where: { id: shelf.id },
  });

  revalidatePath("/library");
  redirect("/library?status=deleted");
}

export async function updateShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawId = formData.get("shelfId");
  const rawName = formData.get("name");

  if (typeof rawId !== "string" || typeof rawName !== "string") {
    redirect("/library?status=edit-missing");
  }

  const shelfId = rawId.trim();
  const name = rawName.trim();

  if (!shelfId || !name) {
    redirect("/library?status=edit-missing");
  }

  if (!isValidShelfName(name)) {
    redirect("/library?status=edit-invalid");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const shelf = await prisma.shelf.findFirst({
    where: {
      id: shelfId,
      libraryId: library.id,
    },
  });

  if (!shelf) {
    redirect("/library?status=edit-notfound");
  }

  const existing = await prisma.shelf.findFirst({
    where: {
      libraryId: library.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: {
        id: shelf.id,
      },
    },
  });

  if (existing) {
    redirect("/library?status=edit-duplicate");
  }

  await prisma.shelf.update({
    where: { id: shelf.id },
    data: { name },
  });

  revalidatePath("/library");
  redirect("/library?status=updated");
}
