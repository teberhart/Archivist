import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createShelf } from "@/app/library/actions";

const statusMessages: Record<string, string> = {
  missing: "Please enter a shelf name.",
  invalid:
    "Shelf names must be 2-50 characters and use letters (including accents), numbers, spaces, apostrophes, ampersands, periods, and dashes.",
  duplicate: "A shelf with that name already exists.",
  nolibrary: "No library found for your account.",
};

export default async function AddShelfPage({
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

  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[var(--glow)] blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-[-10rem] left-[-4rem] h-[18rem] w-[18rem] rounded-full bg-[var(--glow-secondary)] blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <nav className="flex items-center justify-between animate-fade-up">
          <Link className="flex items-center gap-3" href="/library">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent shadow-sm">
              <span className="text-lg font-semibold text-ink">A</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Archivist
              </p>
              <p className="text-lg font-[var(--font-display)]">
                Add a shelf
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/library"
            >
              Back to library
            </Link>
          </div>
        </nav>

        <main className="mt-16 flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Create shelf
              </p>
              <h1 className="text-3xl font-[var(--font-display)]">
                Add a new shelf
              </h1>
              <p className="text-sm text-muted">
                Shelves help you group formats, rooms, or collections.
              </p>
            </div>

            {statusMessage ? (
              <div className="mt-6 rounded-2xl border border-line bg-wash p-4 text-sm text-ink">
                {statusMessage}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" action={createShelf}>
              <label className="block text-sm text-muted" htmlFor="shelf-name">
                Shelf name
                <input
                  id="shelf-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  title="Use 2-50 characters. Letters (including accents), numbers, spaces, apostrophes, ampersands, periods, and dashes only."
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <p className="text-xs text-muted">
                Letters (including accents), numbers, spaces, apostrophes,
                ampersands, periods, and dashes only.
              </p>
              <button
                className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                type="submit"
              >
                Add shelf
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
