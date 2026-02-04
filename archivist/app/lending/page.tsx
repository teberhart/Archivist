import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { returnProduct } from "@/app/library/actions";
import { isAdminUserId } from "@/lib/admin";

const statusMessages: Record<string, string> = {
  "loan-returned": "Item returned.",
  "loan-return-missing": "Unable to return that item.",
  "loan-return-notfound": "No active loan found for that item.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatDate = (value: Date) => dateFormatter.format(value);

export default async function LendingPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = await isAdminUserId(userId);

  if (!userId) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const status = params?.status ?? "";
  const statusMessage = status ? statusMessages[status] : null;

  let loans: Array<{
    id: string;
    borrowerName: string;
    borrowerNotes: string | null;
    lentAt: Date;
    dueAt: Date | null;
    product: {
      id: string;
      name: string;
      artist?: string | null;
      type: string;
      year: number;
      shelf: { name: string } | null;
    };
  }> = [];
  let errorMessage: string | null = null;

  try {
    loans = await prisma.loan.findMany({
      where: {
        userId,
        returnedAt: null,
      },
      include: {
        product: {
          include: {
            shelf: true,
          },
        },
      },
      orderBy: [{ lentAt: "desc" }],
    });
  } catch (error) {
    console.error(error);
    errorMessage = "We couldn't load your lending list. Please try again.";
  }

  const sortedLoans = [...loans].sort((a, b) => {
    const aDue = a.dueAt ? a.dueAt.getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.dueAt ? b.dueAt.getTime() : Number.POSITIVE_INFINITY;
    if (aDue !== bDue) {
      return aDue - bDue;
    }
    return b.lentAt.getTime() - a.lentAt.getTime();
  });

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
              <p className="text-lg font-[var(--font-display)]">Lending</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/"
            >
              Back to home
            </Link>
            {isAdmin ? (
              <Link
                className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
                href="/admin"
              >
                Admin
              </Link>
            ) : null}
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/library"
            >
              Library
            </Link>
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/settings"
            >
              Settings
            </Link>
          </div>
        </nav>

        <main className="mt-16 flex-1">
          <header className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Your lending
            </p>
            <h1 className="mt-3 text-3xl font-[var(--font-display)]">
              Items on loan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Track who has your items and when they should find their way back
              home.
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

          {!errorMessage && sortedLoans.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-line bg-card p-8 text-sm text-muted">
              <p className="text-lg font-semibold text-ink">No items on loan</p>
              <p className="mt-2 max-w-xl">
                Lending in Archivist lets you remember who borrowed something and
                when it should return. Use the lending section inside any item
                to mark it as lent.
              </p>
              <Link
                className="mt-6 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                href="/library"
              >
                Go to your library
              </Link>
            </div>
          ) : null}

          {!errorMessage && sortedLoans.length > 0 ? (
            <div className="mt-8 grid gap-6">
              <div className="rounded-3xl border border-line bg-card p-6 text-sm text-ink">
                {sortedLoans.length} item{sortedLoans.length === 1 ? "" : "s"} on
                loan
              </div>
              {sortedLoans.map((loan) => (
                <article
                  key={loan.id}
                  className="rounded-3xl border border-line bg-card p-6 shadow-sm"
                  data-cy="loan-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        {loan.product.shelf?.name ?? "Unknown shelf"}
                      </p>
                      <h2 className="mt-2 text-2xl font-[var(--font-display)] text-ink">
                        {loan.product.name}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                        {loan.product.type}
                        {loan.product.artist ? ` · ${loan.product.artist}` : ""} ·{" "}
                        {loan.product.year}
                      </p>
                    </div>
                    <form action={returnProduct}>
                      <input type="hidden" name="productId" value={loan.product.id} />
                      <input type="hidden" name="redirectTo" value="/lending" />
                      <button
                        className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
                        type="submit"
                        data-cy="loan-return-button"
                      >
                        Mark returned
                      </button>
                    </form>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em]">
                        Borrower
                      </p>
                      <p className="mt-1 text-ink">{loan.borrowerName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em]">Lent</p>
                      <p className="mt-1 text-ink">{formatDate(loan.lentAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em]">Due</p>
                      <p className="mt-1 text-ink">
                        {loan.dueAt ? formatDate(loan.dueAt) : "No due date"}
                      </p>
                    </div>
                  </div>
                  {loan.borrowerNotes ? (
                    <div className="mt-4 rounded-2xl border border-line bg-wash p-4 text-sm text-muted">
                      {loan.borrowerNotes}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
