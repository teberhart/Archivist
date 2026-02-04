type MockSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

let session: MockSession = null;

export function __setSession(nextSession: MockSession) {
  session = nextSession;
}

export async function auth() {
  return session;
}

export async function signIn() {
  return null;
}

export async function signOut() {
  return null;
}

export const handlers = {};
