import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  updateAccount,
  updateLibrary,
  updatePassword,
  updatePreferences,
} from "@/app/settings/actions";
import { isAdminUserId } from "@/lib/admin";

const statusMessages: Record<string, { tone: "success" | "error"; message: string }> = {
  "account-updated": { tone: "success", message: "Account details updated." },
  "account-missing": { tone: "error", message: "Please complete all account fields." },
  "account-invalid": { tone: "error", message: "Name must be 2-60 characters." },
  "account-email": { tone: "error", message: "Enter a valid email address." },
  "account-duplicate": {
    tone: "error",
    message: "Another account already uses that email.",
  },
  "library-updated": { tone: "success", message: "Library name updated." },
  "library-missing": { tone: "error", message: "Please enter a library name." },
  "library-invalid": {
    tone: "error",
    message:
      "Library names must be 2-50 characters and use letters, numbers, spaces, apostrophes, ampersands, periods, and dashes.",
  },
  "library-notfound": { tone: "error", message: "No library found for your account." },
  "prefs-updated": { tone: "success", message: "Preferences saved." },
  "password-updated": { tone: "success", message: "Password updated." },
  "password-missing": { tone: "error", message: "Please complete all password fields." },
  "password-invalid": {
    tone: "error",
    message: "New password must be at least 8 characters.",
  },
  "password-mismatch": { tone: "error", message: "New passwords do not match." },
  "password-incorrect": { tone: "error", message: "Current password is incorrect." },
};

export default async function SettingsPage({
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

  const [user, library, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.library.findUnique({
      where: { userId },
      select: { name: true },
    }),
    prisma.userSettings.findUnique({
      where: { userId },
      select: { showShelfPulse: true },
    }),
  ]);

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
              <p className="text-lg font-[var(--font-display)]">Settings</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/library"
            >
              Back to library
            </Link>
            {isAdmin ? (
              <Link
                className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
                href="/admin"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </nav>

        <main className="mt-16 flex flex-1 flex-col gap-8">
          <header className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Account
            </p>
            <h1 className="mt-3 text-3xl font-[var(--font-display)]">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Update your profile details and tune how Archivist works for you.
            </p>
          </header>

          {statusMessage ? (
            <div
              className={`rounded-2xl border px-5 py-4 text-sm animate-fade-up ${
                statusMessage.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {statusMessage.message}
            </div>
          ) : null}

          <section className="rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-[var(--font-display)]">Profile</h2>
                <p className="mt-2 text-sm text-muted">
                  Keep your name and email up to date.
                </p>
              </div>
            </div>
            <form className="mt-6 grid gap-4" action={updateAccount}>
              <label className="text-sm text-muted" htmlFor="settings-name">
                Name
                <input
                  id="settings-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  defaultValue={user?.name ?? ""}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <label className="text-sm text-muted" htmlFor="settings-email">
                Email address
                <input
                  id="settings-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user?.email ?? ""}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <div className="flex justify-end">
                <button
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                  type="submit"
                >
                  Save account
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div>
              <h2 className="text-xl font-[var(--font-display)]">Library</h2>
              <p className="mt-2 text-sm text-muted">
                Personalize the name shown across your shelves.
              </p>
            </div>
            <form className="mt-6 grid gap-4" action={updateLibrary}>
              <label className="text-sm text-muted" htmlFor="settings-library-name">
                Library name
                <input
                  id="settings-library-name"
                  name="libraryName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  defaultValue={library?.name ?? ""}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <div className="flex justify-end">
                <button
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                  type="submit"
                >
                  Save library
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div>
              <h2 className="text-xl font-[var(--font-display)]">Preferences</h2>
              <p className="mt-2 text-sm text-muted">
                Tune the experience to match your workflow.
              </p>
            </div>
            <form className="mt-6 grid gap-4" action={updatePreferences}>
              <label className="flex items-center gap-3 text-sm text-muted">
                <input
                  name="showShelfPulse"
                  type="checkbox"
                  defaultChecked={settings?.showShelfPulse ?? true}
                  className="h-4 w-4 rounded border-line text-ink"
                />
                Show Shelf Pulse on the home page
              </label>
              <div className="flex justify-end">
                <button
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                  type="submit"
                >
                  Save preferences
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-line bg-card p-8 shadow-sm animate-fade-up">
            <div>
              <h2 className="text-xl font-[var(--font-display)]">Security</h2>
              <p className="mt-2 text-sm text-muted">
                Update your password regularly to keep your account safe.
              </p>
            </div>
            <form className="mt-6 grid gap-4" action={updatePassword}>
              <label className="text-sm text-muted" htmlFor="settings-current-password">
                Current password
                <input
                  id="settings-current-password"
                  name="currentPassword"
                  type="password"
                  required
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <label className="text-sm text-muted" htmlFor="settings-new-password">
                New password
                <input
                  id="settings-new-password"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <label
                className="text-sm text-muted"
                htmlFor="settings-confirm-password"
              >
                Confirm new password
                <input
                  id="settings-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
              <div className="flex justify-end">
                <button
                  className="rounded-full border border-rose-200 bg-rose-100 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-200"
                  type="submit"
                >
                  Update password
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
