import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUserId } from "@/lib/admin";
import type { UserStatus } from "@prisma/client";
import {
  addProductType,
  deleteUser,
  removeProductType,
  updateUserStatus,
} from "@/app/admin/actions";
import AdminUserActions from "@/app/admin/AdminUserActions";
import AdminProductTypes from "@/app/admin/AdminProductTypes";

const statusLabels: Record<UserStatus, string> = {
  STANDARD: "Standard",
  VIP: "VIP",
  ADMIN: "Admin",
};

const statusBadgeStyles: Record<UserStatus, string> = {
  STANDARD: "border-line bg-wash text-muted",
  VIP: "border-amber-200 bg-amber-50 text-amber-900",
  ADMIN: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

const statusFilters: Array<{ label: string; value: string }> = [
  { label: "All", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "VIP", value: "vip" },
  { label: "Admin", value: "admin" },
];

function resolveStatusFilter(value?: string): UserStatus | null {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "standard") {
    return "STANDARD";
  }
  if (normalized === "vip") {
    return "VIP";
  }
  if (normalized === "admin") {
    return "ADMIN";
  }
  return null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string; tab?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!(await isAdminUserId(session.user.id))) {
    redirect("/");
  }

  const params = searchParams ? await searchParams : {};
  const statusParam = params?.status ?? "all";
  const statusMessageParam = params?.message ?? "";
  const tabParam = params?.tab ?? "users";
  const isTypesTab = tabParam === "types";
  const statusFilter = resolveStatusFilter(statusParam);
  const statusMessage = statusMessageParam
    ? {
        "vip-enabled": {
          tone: "success",
          message: "User promoted to VIP.",
        },
        "vip-disabled": {
          tone: "success",
          message: "User returned to Standard.",
        },
        "user-deleted": {
          tone: "success",
          message: "User account deleted.",
        },
        "delete-self": {
          tone: "error",
          message: "You cannot delete your own account.",
        },
        "invalid-action": {
          tone: "error",
          message: "Invalid admin action.",
        },
        "protected-user": {
          tone: "error",
          message: "Admin accounts cannot be modified here.",
        },
        "type-added": {
          tone: "success",
          message: "Product type added.",
        },
        "type-removed": {
          tone: "success",
          message: "Product type removed.",
        },
        "type-exists": {
          tone: "error",
          message: "That product type already exists.",
        },
        "type-in-use": {
          tone: "error",
          message: "That product type is in use and cannot be removed.",
        },
        "invalid-type": {
          tone: "error",
          message: "Enter a valid product type name.",
        },
      }[statusMessageParam] ?? null
    : null;

  const [users, productTypes] = await Promise.all([
    isTypesTab
      ? Promise.resolve([])
      : prisma.user.findMany({
          where: statusFilter ? { status: statusFilter } : undefined,
          orderBy: [{ status: "desc" }, { email: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            library: {
              select: {
                name: true,
                shelves: {
                  orderBy: { name: "asc" },
                  select: {
                    id: true,
                    name: true,
                    products: {
                      orderBy: { name: "asc" },
                      select: {
                        id: true,
                        name: true,
                        type: true,
                        year: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
    prisma.productType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
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
              <p className="text-lg font-[var(--font-display)]">Admin</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="rounded-full border border-line px-4 py-2 text-ink transition hover:border-ink"
              href="/library"
            >
              Back to library
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
          <header className="flex flex-wrap items-end justify-between gap-6 animate-fade-up">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Admin only
              </p>
              <h1 className="mt-3 text-3xl font-[var(--font-display)]">
                User directory
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Browse every account and explore their libraries.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/admin"
                className={`rounded-full border px-3 py-1 uppercase tracking-[0.2em] transition ${
                  !isTypesTab
                    ? "border-ink bg-ink text-white"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                Users
              </Link>
              <Link
                href="/admin?tab=types"
                className={`rounded-full border px-3 py-1 uppercase tracking-[0.2em] transition ${
                  isTypesTab
                    ? "border-ink bg-ink text-white"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                Product Types
              </Link>
            </div>
          </header>

          {statusMessage ? (
            <div
              className={`mt-6 rounded-2xl border px-5 py-4 text-sm animate-fade-up ${
                statusMessage.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {statusMessage.message}
            </div>
          ) : null}

          {isTypesTab ? (
            <AdminProductTypes
              types={productTypes}
              addProductType={addProductType}
              removeProductType={removeProductType}
            />
          ) : (
            <>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                {statusFilters.map((filter) => {
                  const isActive = statusParam === filter.value;
                  return (
                    <Link
                      key={filter.value}
                      href={
                        filter.value === "all"
                          ? "/admin"
                          : `/admin?status=${filter.value}`
                      }
                      className={`rounded-full border px-3 py-1 uppercase tracking-[0.2em] transition ${
                        isActive
                          ? "border-ink bg-ink text-white"
                          : "border-line text-muted hover:border-ink hover:text-ink"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
              <section className="mt-6 grid gap-6">
                {users.length === 0 ? (
                  <div className="rounded-3xl border border-line bg-card p-8 text-sm text-muted">
                    No users found for this filter.
                  </div>
                ) : (
                  users.map((user) => {
                    const shelves = user.library?.shelves ?? [];
                    const totalProducts = shelves.reduce(
                      (total, shelf) => total + shelf.products.length,
                      0,
                    );
                    const isSelf = session.user?.id === user.id;

                    return (
                      <article
                        key={user.id}
                        className="rounded-3xl border border-line bg-card p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-ink">
                              {user.name ?? "Unnamed user"}
                            </p>
                            <p className="text-sm text-muted">{user.email}</p>
                          </div>
                          <div
                            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                              statusBadgeStyles[user.status]
                            }`}
                          >
                            {statusLabels[user.status]}
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-line bg-wash p-4 text-sm text-muted">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span>
                              Library: {user.library?.name ?? "No library"}
                            </span>
                            <span>
                              {shelves.length} shelves · {totalProducts} items
                            </span>
                          </div>
                        </div>

                        <AdminUserActions
                          userId={user.id}
                          status={user.status}
                          isSelf={isSelf}
                          updateUserStatus={updateUserStatus}
                          deleteUser={deleteUser}
                        />

                        {shelves.length === 0 ? (
                          <p className="mt-4 text-sm text-muted">
                            No shelves on file yet.
                          </p>
                        ) : (
                          <div className="mt-4 grid gap-4">
                            {shelves.map((shelf) => (
                              <details
                                key={shelf.id}
                                className="rounded-2xl border border-line bg-white p-4"
                              >
                                <summary className="cursor-pointer text-sm font-semibold text-ink">
                                  {shelf.name} ({shelf.products.length} items)
                                </summary>
                                {shelf.products.length === 0 ? (
                                  <p className="mt-3 text-sm text-muted">
                                    No items in this shelf yet.
                                  </p>
                                ) : (
                                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                                    {shelf.products.map((product) => (
                                      <li
                                        key={product.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-wash px-3 py-2"
                                      >
                                        <span className="text-ink">
                                          {product.name}
                                        </span>
                                        <span>
                                          {product.type} · {product.year}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </details>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
