"use client";

import type { UserStatus } from "@prisma/client";

type AdminUserActionsProps = {
  userId: string;
  status: UserStatus;
  isSelf: boolean;
  updateUserStatus: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
};

export default function AdminUserActions({
  userId,
  status,
  isSelf,
  updateUserStatus,
  deleteUser,
}: AdminUserActionsProps) {
  const canToggleVip = status !== "ADMIN";
  const nextStatus = status === "VIP" ? "STANDARD" : "VIP";
  const vipLabel = status === "VIP" ? "Remove VIP" : "Make VIP";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <form action={updateUserStatus}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="status" value={nextStatus} />
        <button
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            canToggleVip
              ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
              : "border-line bg-wash text-muted cursor-not-allowed"
          }`}
          type="submit"
          disabled={!canToggleVip}
        >
          {vipLabel}
        </button>
      </form>
      <form
        action={deleteUser}
        onSubmit={(event) => {
          if (isSelf) {
            event.preventDefault();
            return;
          }
          if (!window.confirm("Delete this user account?")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <button
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            isSelf
              ? "border-line bg-wash text-muted cursor-not-allowed"
              : "border-rose-200 bg-rose-100 text-rose-700 hover:border-rose-300 hover:bg-rose-200"
          }`}
          type="submit"
          disabled={isSelf}
        >
          Delete user
        </button>
      </form>
      {isSelf ? (
        <span className="text-xs text-muted">You cannot delete yourself.</span>
      ) : null}
    </div>
  );
}
