import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createProduct,
  deleteShelf,
  updateProduct,
  updateShelf,
} from "@/app/library/actions";
import ShelfCard from "@/app/library/ShelfCard";

const statusMessages: Record<string, string> = {
  created: "Shelf added successfully.",
  deleted: "Shelf deleted.",
  "delete-missing": "Unable to delete shelf.",
  updated: "Shelf updated.",
  "item-created": "Item added to shelf.",
  "item-missing": "Please complete all item fields.",
  "item-invalid":
    "Item details contain invalid characters. Use letters (including accents), numbers, spaces, and basic punctuation.",
  "item-year": "Please enter a valid year.",
  "item-shelf": "Unable to find that shelf.",
  "item-updated": "Item updated.",
  "item-edit-missing": "Please complete all item fields.",
  "item-edit-invalid":
    "Item details contain invalid characters. Use letters (including accents), numbers, spaces, and basic punctuation.",
  "item-edit-year": "Please enter a valid year.",
  "item-edit-notfound": "Unable to find that item.",
  "edit-missing": "Please enter a shelf name.",
  "edit-invalid":
    "Shelf names must be 2-50 characters and use letters (including accents), numbers, spaces, apostrophes, ampersands, periods, and dashes.",
  "edit-duplicate": "A shelf with that name already exists.",
  "edit-notfound": "Unable to find that shelf.",
  nolibrary: "No library found for your account.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const status = params?.status ?? "";
  const statusMessage = status ? statusMessages[status] : null;

  let library = null;
  let errorMessage: string | null = null;

  try {
    library = await prisma.library.findUnique({
      where: { userId },
      include: { shelves: { include: { products: true } } },
    });
  } catch (error) {
    console.error(error);
    errorMessage = "We couldn't load your library. Please try again.";
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[var(--glow)] blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-[-10rem] left-[-4rem] h-[18rem] w-[18rem] rounded-full bg-[var(--glow-secondary)] blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <nav className="flex items-center justify-between animate-fade-up">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent shadow-sm">
              <span className="text-lg font-semibold text-ink">A</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Archivist
              </p>
              <p className="text-lg font-[var(--font-display)]">
                Physical Library
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/"
            >
              Back to home
            </Link>
            <Link
              className="rounded-full bg-accent px-4 py-2 font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
              href="/library/add-shelf"
            >
              Add shelf
            </Link>
          </div>
        </nav>

        <main className="mt-16 flex-1">
          <header className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Your shelves
            </p>
            <h1 className="mt-3 text-3xl font-[var(--font-display)]">
              {library?.name ?? "Your library"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Browse your physical media arranged by shelf. Add shelves to keep
              formats and spaces organized.
            </p>
          </header>

          {statusMessage ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 animate-fade-up">
              {statusMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-8 rounded-3xl border border-line bg-card p-6 text-sm text-ink">
              {errorMessage}
            </div>
          ) : null}

          {!errorMessage && (!library || library.shelves.length === 0) ? (
            <div className="mt-8 rounded-3xl border border-line bg-card p-8 text-center text-sm text-muted">
              <p className="text-lg font-semibold text-ink">No shelves yet</p>
              <p className="mt-2">
                Create your first shelf to start sorting your collection.
              </p>
            </div>
          ) : null}

          {library && library.shelves.length > 0 ? (
            <div className="mt-8 grid gap-6">
              {library.shelves.map((shelf, index) => (
                <ShelfCard
                  key={shelf.id}
                  shelf={shelf}
                  index={index}
                  updateShelf={updateShelf}
                  createProduct={createProduct}
                  updateProduct={updateProduct}
                  deleteShelf={deleteShelf}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
