"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  parseImportText,
  type ImportShelf,
} from "@/app/library/importParser";
import {
  importProducts,
  type ImportProductsState,
} from "@/app/library/actions";

type ImportProductsModalProps = {
  buttonLabel?: string;
  buttonClassName?: string;
  initialOpen?: boolean;
};

type ImportPreview = {
  shelves: ImportShelf[];
  errors: string[];
};

const MAX_FILE_BYTES = 1024 * 1024;

const initialState: ImportProductsState = {
  status: "idle",
  message: "",
};

export default function ImportProductsModal({
  buttonLabel = "Import products",
  buttonClassName,
  initialOpen = false,
}: ImportProductsModalProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    importProducts,
    initialState,
  );

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!initialOpen) {
      return;
    }
    setIsOpen(true);
  }, [initialOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (state.status === "success" || state.status === "partial") {
      router.refresh();
    }
  }, [state.status, router]);

  const summary = state.summary;

  const previewSummary = useMemo(() => {
    if (!preview) {
      return null;
    }
    const shelfCount = preview.shelves.length;
    const productCount = preview.shelves.reduce(
      (total, shelf) => total + shelf.products.length,
      0,
    );
    return { shelfCount, productCount };
  }, [preview]);

  const resetPreview = () => {
    setPreview(null);
    setClientErrors([]);
    setFileName(null);
    setHasSubmitted(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetPreview();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    resetPreview();

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setClientErrors(["The JSON file is too large (max 1MB)."]);
      return;
    }

    if (
      file.type &&
      file.type !== "application/json" &&
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setClientErrors(["The upload must be a .json file."]);
      return;
    }

    const text = await file.text();
    if (!text.trim()) {
      setClientErrors(["The JSON file is empty."]);
      return;
    }

    const parsed = parseImportText(text);
    setPreview(parsed);
    setFileName(file.name);
    setClientErrors(parsed.errors);
  };

  const canSubmit = !!fileName && (preview?.shelves.length ?? 0) > 0;

  return (
    <>
      <button
        className={buttonClassName ?? "rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
      </button>

      {isOpen && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeModal();
                }
              }}
            >
              <div
                className="w-full max-w-2xl rounded-3xl border border-line bg-card p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="import-products-title"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      Import products
                    </p>
                    <h3
                      id="import-products-title"
                      className="mt-2 text-2xl font-[var(--font-display)] text-ink"
                    >
                      Bring in shelves and items
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      Upload a JSON file to create or update shelves and products.
                    </p>
                  </div>
                  <button
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-ink"
                    type="button"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>

                <form
                  className="mt-6 grid gap-4"
                  action={formAction}
                  onSubmit={() => setHasSubmitted(true)}
                >
                  <label className="text-xs text-muted" htmlFor="import-file">
                    JSON file
                    <input
                      id="import-file"
                      name="file"
                      type="file"
                      accept="application/json,.json"
                      onChange={handleFileChange}
                      className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                      required
                    />
                  </label>

                  <div className="rounded-2xl border border-line bg-wash p-4 text-xs text-muted">
                    <p className="text-sm font-semibold text-ink">Expected schema</p>
                    <p className="mt-2">
                      Top-level object maps shelf names to arrays of products:
                    </p>
                    <pre className="mt-3 overflow-auto rounded-2xl bg-white p-3 text-[11px] text-ink">
{`{
  "Living Room": [
    { "Name": "Blade Runner", "Type": "Tape", "Year": 1982 }
  ]
}`}
                    </pre>
                    <p className="mt-3">
                      Shelves are matched by name. Products are matched by name
                      within a shelf and updated if they already exist.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        className="text-ink underline"
                        href="/example_import.json"
                        download
                      >
                        Download sample JSON
                      </a>
                      <span>Max file size: 1MB.</span>
                    </div>
                  </div>

                  {fileName ? (
                    <div className="rounded-2xl border border-line bg-card p-4 text-xs text-muted">
                      <p className="text-sm font-semibold text-ink">
                        Preview for {fileName}
                      </p>
                      {previewSummary ? (
                        <p className="mt-2">
                          {previewSummary.shelfCount} shelves,{" "}
                          {previewSummary.productCount} products.
                        </p>
                      ) : null}
                      {preview?.shelves.length ? (
                        <ul className="mt-3 space-y-2">
                          {preview.shelves.map((shelf) => (
                            <li key={shelf.name}>
                              {shelf.name} ({shelf.products.length} products)
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}

                  {clientErrors.length > 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      <p className="text-sm font-semibold">
                        Issues found (these entries will be skipped)
                      </p>
                      <ul className="mt-2 space-y-1">
                        {clientErrors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {hasSubmitted && state.status !== "idle" ? (
                    <div
                      className={`rounded-2xl border p-4 text-xs ${
                        state.status === "error"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : state.status === "partial"
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                      }`}
                    >
                      <p className="text-sm font-semibold">{state.message}</p>
                      {summary ? (
                        <p className="mt-2">
                          Shelves created: {summary.shelvesCreated}. Shelves matched:{" "}
                          {summary.shelvesMatched}. Products created:{" "}
                          {summary.productsCreated}. Products updated:{" "}
                          {summary.productsUpdated}.
                        </p>
                      ) : null}
                      {state.errors?.length ? (
                        <ul className="mt-3 space-y-1">
                          {state.errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
                      type="button"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={!canSubmit || isPending}
                    >
                      {isPending ? "Importing..." : "Import products"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
