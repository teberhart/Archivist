import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Email or password didn\'t match.",
  AccessDenied: "Access denied. Please contact support.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const error = searchParams?.error;
  const message = error ? errorMessages[error] ?? "Unable to sign in." : null;

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
          <Link
            className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
            href="/"
          >
            Back to home
          </Link>
        </nav>

        <main className="mt-20 flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Welcome back
              </p>
              <h1 className="text-3xl font-[var(--font-display)]">
                Sign in to Archivist
              </h1>
              <p className="text-sm text-muted">
                Access is currently limited to existing accounts.
              </p>
            </div>

            {message ? (
              <div className="mt-6 rounded-2xl border border-line bg-wash p-4 text-sm text-ink">
                {message}
              </div>
            ) : null}

            <form
              className="mt-6 space-y-4"
              action={async (formData) => {
                "use server";
                const email = formData.get("email");
                const password = formData.get("password");

                if (typeof email !== "string" || typeof password !== "string") {
                  return;
                }

                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: "/",
                });
              }}
            >
              <label className="block text-sm text-muted" htmlFor="email">
                Email address
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <label className="block text-sm text-muted" htmlFor="password">
                Password
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <button
                className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                type="submit"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-xs text-muted">
              Need access? Reach out to the Archivist team for an invite.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
