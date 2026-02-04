"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DeleteShelfForm from "@/app/library/DeleteShelfForm";
import {
  SHELF_NAME_HELP,
  SHELF_NAME_MAX,
  SHELF_NAME_MIN,
} from "@/app/library/shelfValidation";
import {
  PRODUCT_NAME_HELP,
  PRODUCT_NAME_MAX,
  PRODUCT_NAME_MIN,
  PRODUCT_YEAR_MIN,
  getProductYearMax,
} from "@/app/library/productValidation";
import {
  ARTIST_NAME_HELP,
  ARTIST_NAME_MAX,
  ARTIST_NAME_MIN,
} from "@/app/library/artistValidation";
import {
  BORROWER_NAME_HELP,
  BORROWER_NAME_MAX,
  BORROWER_NAME_MIN,
  BORROWER_NOTES_HELP,
  BORROWER_NOTES_MAX,
} from "@/app/library/lendingValidation";

const loanDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatLoanDate = (value: string) => {
  return loanDateFormatter.format(new Date(value));
};

const formatInputDate = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
};

type LoanHistoryItem = {
  id: string;
  borrowerName: string;
  lentAt: string;
  dueAt?: string | null;
  returnedAt?: string | null;
  borrowerNotes?: string | null;
};

type ShelfProduct = {
  id: string;
  name: string;
  artist?: string | null;
  type: string;
  year: number;
  activeLoan?: LoanHistoryItem | null;
  loanHistory?: LoanHistoryItem[];
};

type Shelf = {
  id: string;
  name: string;
  products: ShelfProduct[];
};

type ShelfCardProps = {
  shelf: Shelf;
  index: number;
  productTypes: string[];
  updateShelf: (formData: FormData) => Promise<void>;
  createProduct: (formData: FormData) => Promise<void>;
  updateProduct: (formData: FormData) => Promise<void>;
  lendProduct: (formData: FormData) => Promise<void>;
  returnProduct: (formData: FormData) => Promise<void>;
  deleteProduct: (formData: FormData) => Promise<void>;
  deleteShelf: (formData: FormData) => Promise<void>;
};

export default function ShelfCard({
  shelf,
  index,
  productTypes,
  updateShelf,
  createProduct,
  updateProduct,
  lendProduct,
  returnProduct,
  deleteProduct,
  deleteShelf,
}: ShelfCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(shelf.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemArtist, setItemArtist] = useState("");
  const [itemType, setItemType] = useState(productTypes[0] ?? "");
  const [itemYear, setItemYear] = useState(
    String(getProductYearMax() - 1),
  );
  const [editingProduct, setEditingProduct] = useState<ShelfProduct | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editType, setEditType] = useState(productTypes[0] ?? "");
  const [editYear, setEditYear] = useState(String(getProductYearMax() - 1));
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerNotes, setBorrowerNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const formId = `edit-shelf-${shelf.id}`;
  const inputId = `${formId}-name`;
  const itemFormId = `add-item-${shelf.id}`;
  const itemNameId = `${itemFormId}-name`;
  const itemArtistId = `${itemFormId}-artist`;
  const itemTypeId = `${itemFormId}-type`;
  const itemYearId = `${itemFormId}-year`;
  const editFormId = `edit-item-${shelf.id}`;
  const editNameId = `${editFormId}-name`;
  const editArtistId = `${editFormId}-artist`;
  const editTypeId = `${editFormId}-type`;
  const editYearId = `${editFormId}-year`;
  const deleteFormId = `${editFormId}-delete`;
  const lendFormId = `${editFormId}-lend`;
  const returnFormId = `${editFormId}-return`;

  const startEditing = () => {
    setName(shelf.name);
    setEditingProduct(null);
    setIsAddingItem(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setName(shelf.name);
    setIsEditing(false);
  };

  const startAddingItem = () => {
    setItemName("");
    setItemArtist("");
    setItemType(productTypes[0] ?? "");
    setItemYear(String(getProductYearMax() - 1));
    setEditingProduct(null);
    setIsEditing(false);
    setIsAddingItem(true);
  };

  const cancelAddingItem = () => {
    setIsAddingItem(false);
  };

  const startEditingItem = (product: ShelfProduct) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditArtist(product.artist ?? "");
    setEditType(product.type);
    setEditYear(String(product.year));
    setBorrowerName(product.activeLoan?.borrowerName ?? "");
    setBorrowerNotes(product.activeLoan?.borrowerNotes ?? "");
    setDueDate(formatInputDate(product.activeLoan?.dueAt));
    setIsAddingItem(false);
    setIsEditing(false);
  };

  const cancelEditingItem = () => {
    setEditingProduct(null);
  };

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelEditingItem();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [editingProduct]);

  useEffect(() => {
    if (!editingProduct) {
      setBorrowerName("");
      setBorrowerNotes("");
      setDueDate("");
      setEditArtist("");
      return;
    }

    setBorrowerName(editingProduct.activeLoan?.borrowerName ?? "");
    setBorrowerNotes(editingProduct.activeLoan?.borrowerNotes ?? "");
    setDueDate(formatInputDate(editingProduct.activeLoan?.dueAt));
    setEditArtist(editingProduct.artist ?? "");
  }, [editingProduct]);

  const hasTypeOptions = productTypes.length > 0;
  const editTypeOptions = editingProduct
    ? productTypes.includes(editingProduct.type)
      ? productTypes
      : [editingProduct.type, ...productTypes]
    : productTypes;

  return (
    <section
      className="rounded-3xl border border-line bg-card p-6 shadow-sm animate-fade-up"
      style={{ animationDelay: `${150 + index * 80}ms` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[14rem]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Shelf</p>
          {isEditing ? (
            <form
              id={formId}
              action={updateShelf}
              className="mt-2 flex flex-wrap items-center gap-3"
            >
              <input type="hidden" name="shelfId" value={shelf.id} />
              <label className="sr-only" htmlFor={inputId}>
                Shelf name
              </label>
              <input
                id={inputId}
                name="name"
                type="text"
                required
                minLength={SHELF_NAME_MIN}
                maxLength={SHELF_NAME_MAX}
                title={SHELF_NAME_HELP}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full min-w-[16rem] rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                autoFocus
                data-cy="shelf-edit-input"
              />
            </form>
          ) : (
            <h2 className="mt-2 text-2xl font-[var(--font-display)]">
              {shelf.name}
            </h2>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <button
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
              type="button"
              onClick={startEditing}
              data-cy="shelf-edit-button"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                type="submit"
                form={formId}
              >
                Save
              </button>
              <button
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
                type="button"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </>
          )}
          {!isAddingItem ? (
            <button
              className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
              type="button"
              onClick={startAddingItem}
            >
              Add item
            </button>
          ) : (
            <>
              <button
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                type="submit"
                form={itemFormId}
                disabled={!hasTypeOptions}
              >
                Save item
              </button>
              <button
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
                type="button"
                onClick={cancelAddingItem}
              >
                Cancel
              </button>
            </>
          )}
          <DeleteShelfForm shelfId={shelf.id} action={deleteShelf} />
        </div>
      </div>

        {isEditing ? (
          <p className="mt-2 text-xs text-muted">{SHELF_NAME_HELP}</p>
        ) : null}

        {isAddingItem ? (
          <form
            id={itemFormId}
            action={createProduct}
            className="mt-4 grid gap-3 rounded-2xl border border-line bg-wash p-4"
          >
            <input type="hidden" name="shelfId" value={shelf.id} />
            <label className="text-xs text-muted" htmlFor={itemNameId}>
              Item name
              <input
                id={itemNameId}
                name="name"
                type="text"
                required
                minLength={PRODUCT_NAME_MIN}
                maxLength={PRODUCT_NAME_MAX}
                title={PRODUCT_NAME_HELP}
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                autoFocus
              />
            </label>
            <label className="text-xs text-muted" htmlFor={itemArtistId}>
              Artist
              <input
                id={itemArtistId}
                name="artist"
                type="text"
                minLength={ARTIST_NAME_MIN}
                maxLength={ARTIST_NAME_MAX}
                title={ARTIST_NAME_HELP}
                value={itemArtist}
                onChange={(event) => setItemArtist(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-muted sm:col-span-2" htmlFor={itemTypeId}>
                Type
                <select
                  id={itemTypeId}
                  name="type"
                  required
                  value={itemType}
                  onChange={(event) => setItemType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                  disabled={!hasTypeOptions}
                >
                  {hasTypeOptions ? null : (
                    <option value="">No types available</option>
                  )}
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-muted" htmlFor={itemYearId}>
                Year
                <input
                  id={itemYearId}
                  name="year"
                  type="number"
                  required
                  min={PRODUCT_YEAR_MIN}
                  max={getProductYearMax()}
                  value={itemYear}
                  onChange={(event) => setItemYear(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
              </label>
            </div>
            <p className="text-xs text-muted">
              {PRODUCT_NAME_HELP} {ARTIST_NAME_HELP} Year must be between{" "}
              {PRODUCT_YEAR_MIN} and {getProductYearMax()}.
            </p>
            {!hasTypeOptions ? (
              <p className="text-xs text-amber-700">
                Add at least one product type in the Admin page to save items.
              </p>
            ) : null}
          </form>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {shelf.products.length === 0 ? (
            <div className="rounded-2xl border border-line bg-wash p-4 text-sm text-muted sm:col-span-3">
              No items on this shelf yet.
            </div>
          ) : (
            shelf.products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-line bg-wash p-4 text-sm text-muted transition hover:border-ink/40 hover:bg-white cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => startEditingItem(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    startEditingItem(product);
                  }
                }}
                data-cy="product-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                      {product.type}
                      {product.artist ? ` · ${product.artist}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Released {product.year}
                    </p>
                    {product.activeLoan ? (
                      <div className="mt-2 text-xs font-semibold text-amber-700">
                        <p>Lent to {product.activeLoan.borrowerName}</p>
                        {product.activeLoan.dueAt ? (
                          <p className="mt-1 text-[0.7rem] font-medium text-amber-600">
                            Due {formatLoanDate(product.activeLoan.dueAt)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <button
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-ink"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startEditingItem(product);
                    }}
                    data-cy="product-edit-button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {editingProduct && portalTarget
          ? createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10"
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    cancelEditingItem();
                  }
                }}
              >
                <div
                  className="w-full max-w-lg rounded-3xl border border-line bg-card p-6 shadow-xl"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`${editFormId}-title`}
                  data-cy="product-edit-modal"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Edit item
                      </p>
                      <h3
                        id={`${editFormId}-title`}
                        className="mt-2 text-2xl font-[var(--font-display)] text-ink"
                      >
                        {editingProduct.name}
                      </h3>
                    </div>
                    <button
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-ink"
                      type="button"
                      onClick={cancelEditingItem}
                    >
                      Close
                    </button>
                  </div>
                  <form
                    id={editFormId}
                    action={updateProduct}
                    className="mt-4 grid gap-3"
                  >
                    <input
                      type="hidden"
                      name="productId"
                      value={editingProduct.id}
                    />
                    <label className="text-xs text-muted" htmlFor={editNameId}>
                      Item name
                      <input
                        id={editNameId}
                        name="name"
                        type="text"
                        required
                        minLength={PRODUCT_NAME_MIN}
                        maxLength={PRODUCT_NAME_MAX}
                        title={PRODUCT_NAME_HELP}
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                        autoFocus
                      />
                    </label>
                    <label className="text-xs text-muted" htmlFor={editArtistId}>
                      Artist
                      <input
                        id={editArtistId}
                        name="artist"
                        type="text"
                        minLength={ARTIST_NAME_MIN}
                        maxLength={ARTIST_NAME_MAX}
                        title={ARTIST_NAME_HELP}
                        value={editArtist}
                        onChange={(event) => setEditArtist(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label
                        className="text-xs text-muted sm:col-span-2"
                        htmlFor={editTypeId}
                      >
                        Type
                        <select
                          id={editTypeId}
                          name="type"
                          required
                          value={editType}
                          onChange={(event) => setEditType(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                        >
                          {editTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {productTypes.includes(type)
                                ? type
                                : `Legacy: ${type}`}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-muted" htmlFor={editYearId}>
                        Year
                        <input
                          id={editYearId}
                          name="year"
                          type="number"
                          required
                          min={PRODUCT_YEAR_MIN}
                          max={getProductYearMax()}
                          value={editYear}
                          onChange={(event) => setEditYear(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted">
                      {PRODUCT_NAME_HELP} {ARTIST_NAME_HELP} Year must be between{" "}
                      {PRODUCT_YEAR_MIN} and {getProductYearMax()}.
                    </p>
                    <div className="rounded-2xl border border-line bg-wash p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Lending
                      </p>
                      {editingProduct.activeLoan ? (
                        <div className="mt-3 text-sm text-ink">
                          <p>
                            Lent to{" "}
                            <span className="font-semibold">
                              {editingProduct.activeLoan.borrowerName}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Since{" "}
                            {formatLoanDate(editingProduct.activeLoan.lentAt)}
                          </p>
                          {editingProduct.activeLoan.dueAt ? (
                            <p className="mt-1 text-xs text-muted">
                              Due {formatLoanDate(editingProduct.activeLoan.dueAt)}
                            </p>
                          ) : null}
                          {editingProduct.activeLoan.borrowerNotes ? (
                            <p className="mt-2 text-xs text-muted">
                              Notes: {editingProduct.activeLoan.borrowerNotes}
                            </p>
                          ) : null}
                          <button
                            className="mt-3 rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-300"
                            type="submit"
                            form={returnFormId}
                            data-cy="product-return-button"
                          >
                            Mark returned
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          <label
                            className="text-xs text-muted"
                            htmlFor={`${lendFormId}-borrower`}
                          >
                            Borrower
                            <input
                              id={`${lendFormId}-borrower`}
                              name="borrowerName"
                              type="text"
                              required
                              minLength={BORROWER_NAME_MIN}
                              maxLength={BORROWER_NAME_MAX}
                              title={BORROWER_NAME_HELP}
                              value={borrowerName}
                              onChange={(event) =>
                                setBorrowerName(event.target.value)
                              }
                              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                              form={lendFormId}
                            />
                          </label>
                          <label
                            className="text-xs text-muted"
                            htmlFor={`${lendFormId}-due`}
                          >
                            Due date
                            <input
                              id={`${lendFormId}-due`}
                              name="dueAt"
                              type="date"
                              value={dueDate}
                              onChange={(event) =>
                                setDueDate(event.target.value)
                              }
                              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                              form={lendFormId}
                            />
                          </label>
                          <label
                            className="text-xs text-muted"
                            htmlFor={`${lendFormId}-notes`}
                          >
                            Notes
                            <textarea
                              id={`${lendFormId}-notes`}
                              name="borrowerNotes"
                              maxLength={BORROWER_NOTES_MAX}
                              value={borrowerNotes}
                              onChange={(event) =>
                                setBorrowerNotes(event.target.value)
                              }
                              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                              rows={2}
                              form={lendFormId}
                            />
                          </label>
                          <p className="text-xs text-muted">
                            {BORROWER_NAME_HELP} {BORROWER_NOTES_HELP}
                          </p>
                          <button
                            className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                            type="submit"
                            form={lendFormId}
                            data-cy="product-lend-button"
                          >
                            Lend item
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Lending history
                      </p>
                      {editingProduct.loanHistory &&
                      editingProduct.loanHistory.length > 0 ? (
                        <div className="mt-3 grid gap-3 text-sm text-ink">
                          {editingProduct.loanHistory.map((loan) => (
                            <div key={loan.id} className="rounded-2xl bg-wash p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-semibold">
                                  {loan.borrowerName}
                                </p>
                                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
                                  {loan.returnedAt ? "Returned" : "Active"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted">
                                Lent {formatLoanDate(loan.lentAt)}
                                {loan.returnedAt
                                  ? ` · Returned ${formatLoanDate(loan.returnedAt)}`
                                  : ""}
                              </p>
                              {loan.dueAt ? (
                                <p className="mt-1 text-xs text-muted">
                                  Due {formatLoanDate(loan.dueAt)}
                                </p>
                              ) : null}
                              {loan.borrowerNotes ? (
                                <p className="mt-2 text-xs text-muted">
                                  Notes: {loan.borrowerNotes}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-muted">
                          No lending history yet.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
                        type="submit"
                        form={deleteFormId}
                        data-cy="product-delete-button"
                      >
                        Delete item
                      </button>
                      <div className="ml-auto flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
                          type="button"
                          onClick={cancelEditingItem}
                        >
                          Cancel
                        </button>
                        <button
                          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
                          type="submit"
                          form={editFormId}
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </form>
                  <form id={deleteFormId} action={deleteProduct}>
                    <input
                      type="hidden"
                      name="productId"
                      value={editingProduct.id}
                    />
                  </form>
                  <form id={lendFormId} action={lendProduct}>
                    <input
                      type="hidden"
                      name="productId"
                      value={editingProduct.id}
                    />
                  </form>
                  <form id={returnFormId} action={returnProduct}>
                    <input
                      type="hidden"
                      name="productId"
                      value={editingProduct.id}
                    />
                  </form>
                </div>
              </div>,
              portalTarget,
            )
          : null}
    </section>
  );
}
