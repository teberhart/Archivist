export const ADMIN_EMAILS = ["thibaut.eberhart@gmail.com"];

type SessionLike = {
  user?: {
    email?: string | null;
  } | null;
} | null;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }
  return ADMIN_EMAILS.includes(email);
}

export function isAdminSession(session: SessionLike): boolean {
  return isAdminEmail(session?.user?.email ?? null);
}
