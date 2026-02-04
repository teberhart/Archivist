export type MockRouter = {
  refresh: () => void;
  push?: (href: string) => void;
  replace?: (href: string) => void;
};

let router: MockRouter = {
  refresh: () => {},
};

export function __setRouter(nextRouter: MockRouter) {
  router = nextRouter;
}

export function useRouter() {
  return router;
}

export function redirect(url: string): never {
  throw new Error(`NEXT_REDIRECT:${url}`);
}
