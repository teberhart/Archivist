import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ signup?: string }>;
}) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const params = searchParams ? await searchParams : {};
  const showSignupSuccess = params?.signup === "success";
  const libraryItems: {
    id: string;
    name: string;
    type: string;
    year: number;
    shelf: { name: string };
  }[] = isLoggedIn
    ? await prisma.product.findMany({
        where: {
          shelf: {
            library: {
              userId: session?.user?.id ?? "",
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          year: true,
          shelf: {
            select: {
              name: true,
            },
          },
        },
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];
  const featureCards = [
    {
      title: "Track every format",
      description: "Vinyl, VHS, Blu-ray, books, and box sets all live together.",
    },
    {
      title: "Know where things live",
      description: "Keep tabs on shelves, crates, and who borrowed what.",
    },
    {
      title: "Build a calm catalog",
      description: "A light-touch inventory that feels like a personal archive.",
    },
  ];

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
        <a
          className="sr-only focus:not-sr-only focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
          href="#main"
        >
          Skip to content
        </a>
        <nav className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent shadow-sm">
              <Image
                src="/archivist-mark.svg"
                alt="Archivist logo"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Archivist
              </p>
              <p className="text-lg font-[var(--font-display)]">
                Physical Library
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-muted md:flex">
            <Link className="hover:text-ink" href="/library">
              Library
            </Link>
            <a className="hover:text-ink" href="#">
              Lending
            </a>
            <a className="hover:text-ink" href="#">
              Notes
            </a>
          </div>
          <div
            className={`items-center gap-3 text-sm ${
              isLoggedIn ? "flex" : "hidden md:flex"
            }`}
          >
            {isLoggedIn ? (
              <>
                <Link
                  className="hidden rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink md:inline-flex"
                  href="#"
                >
                  Settings
                </Link>
                <Link
                  className="hidden rounded-full bg-accent px-5 py-2 font-semibold text-ink shadow-sm transition hover:bg-accent-strong md:inline-flex"
                  href="#"
                >
                  Add item
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
                    type="submit"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="rounded-full bg-accent px-5 py-2 font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                  href="/signup"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
        {isLoggedIn && showSignupSuccess ? (
          <div className="mt-6 rounded-2xl border border-line bg-wash px-5 py-4 text-sm text-ink animate-fade-up">
            Account created. Welcome to Archivist.
          </div>
        ) : null}

        <main id="main" className="flex-1">
          <header
            className="mt-16 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-wash px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted">
                Chill, organized, yours
              </p>
              <h1 className="text-4xl font-[var(--font-display)] leading-tight md:text-5xl">
                {isLoggedIn
                  ? "Welcome back to your shelf."
                  : "A calm home for your physical media."}
              </h1>
              <p className="max-w-xl text-lg text-muted">
                {isLoggedIn
                  ? "Your library is ready to browse. Pick up where you left off and keep your collection flowing."
                  : "Archivist keeps your tapes, discs, books, and vinyl together in one gentle catalog that feels like a personal archive."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <button className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong">
                      Add new item
                    </button>
                    <Link
                      className="rounded-full border border-line px-6 py-3 text-sm text-ink transition hover:border-ink"
                      href="/library"
                    >
                      View library
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                      href="/signup"
                    >
                      Create account
                    </Link>
                    <Link
                      className="rounded-full border border-line px-6 py-3 text-sm text-ink transition hover:border-ink"
                      href="/login"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Shelf pulse
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-4xl font-[var(--font-display)]">128</p>
                  <p className="text-sm text-muted">items tracked</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Most active shelf</span>
                  <span className="font-medium text-ink">Living Room</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Recently added</span>
                  <span className="font-medium text-ink">3 this week</span>
                </div>
                <div className="rounded-2xl bg-wash p-4 text-sm text-muted">
                  Keep your lending list tidy and never lose track of a favorite
                  album again.
                </div>
              </div>
            </div>
          </header>

          <section
            id="about"
            className="mt-16 rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            {isLoggedIn ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      Library preview
                    </p>
                    <h2 className="mt-3 text-2xl font-[var(--font-display)]">
                      Your collection, at a glance
                    </h2>
                  </div>
                  <button className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink">
                    Filter items
                  </button>
                </div>
                <ul className="mt-6 grid gap-4 md:grid-cols-2">
                  {libraryItems.length === 0 ? (
                    <li className="rounded-2xl border border-line bg-wash p-5 text-sm text-muted md:col-span-2">
                      No items in your library yet.
                    </li>
                  ) : (
                    libraryItems.map((item, index) => (
                      <li
                        key={item.id}
                        className="rounded-2xl border border-line bg-wash p-5 animate-fade-up"
                        style={{ animationDelay: `${320 + index * 80}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-ink">
                              {item.name}
                            </p>
                            <p className="text-sm text-muted">
                              {item.type} · {item.year}
                            </p>
                          </div>
                          <span className="rounded-full bg-card px-3 py-1 text-xs text-muted">
                            Available
                          </span>
                        </div>
                        <p className="mt-4 text-sm text-muted">
                          Stored in {item.shelf.name}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    How Archivist feels
                  </p>
                  <h2 className="mt-3 text-2xl font-[var(--font-display)]">
                    A gentle way to organize your shelf
                  </h2>
                  <p className="mt-3 max-w-2xl text-muted">
                    Build a quiet catalog for the media you love. Archivist keeps
                    everything easy to find without feeling like a spreadsheet.
                  </p>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {featureCards.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-line bg-wash p-5 animate-fade-up"
                      style={{ animationDelay: `${320 + index * 80}ms` }}
                    >
                      <h3 className="text-lg font-semibold text-ink">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>

        <footer
          className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 text-sm text-muted md:flex-row md:items-center animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wash">
              <Image
                src="/archivist-mark.svg"
                alt="Archivist logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </div>
            <div>
              <p className="font-semibold text-ink">Archivist</p>
              <p>Quiet catalogs for physical media.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a className="hover:text-ink" href="#">
              Privacy
            </a>
            <a className="hover:text-ink" href="#">
              Support
            </a>
            <a className="hover:text-ink" href="#">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
