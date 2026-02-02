import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const errorMessages: Record<string, string> = {
  missing: "Please fill in all fields.",
  invalid: "Enter a valid email address.",
  duplicate: "An account with this email already exists.",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const params = searchParams ? await searchParams : {};
  const error = params?.error;
  const message = error ? errorMessages[error] ?? "Unable to sign up." : null;

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
                Start your archive
              </p>
              <h1 className="text-3xl font-[var(--font-display)]">
                Create your Archivist account
              </h1>
              <p className="text-sm text-muted">
                No email verification for now. We will trust your inputs.
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
                const rawName = formData.get("name");
                const rawEmail = formData.get("email");
                const rawPassword = formData.get("password");

                if (
                  typeof rawName !== "string" ||
                  typeof rawEmail !== "string" ||
                  typeof rawPassword !== "string"
                ) {
                  redirect("/signup?error=missing");
                }

                const name = rawName.trim();
                const email = rawEmail.trim().toLowerCase();
                const password = rawPassword.trim();

                if (!name || !email || !password) {
                  redirect("/signup?error=missing");
                }

                if (!emailPattern.test(email)) {
                  redirect("/signup?error=invalid");
                }

                const hashed = await bcrypt.hash(password, 12);
                const libraryName = `${name}'s Library`;

                try {
                  await prisma.user.create({
                    data: {
                      name,
                      email,
                      password: hashed,
                      library: {
                        create: {
                          name: libraryName,
                        },
                      },
                    },
                  });
                } catch (error) {
                  if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                  ) {
                    redirect("/signup?error=duplicate");
                  }
                  throw error;
                }

                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: "/?signup=success",
                });
              }}
            >
              <label className="block text-sm text-muted" htmlFor="name">
                Name
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
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
                  autoComplete="new-password"
                  required
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <button
                className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                type="submit"
              >
                Create account
              </button>
            </form>

            <p className="mt-6 text-xs text-muted">
              Already have an account?{" "}
              <Link className="text-ink underline" href="/login">
                Sign in
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
