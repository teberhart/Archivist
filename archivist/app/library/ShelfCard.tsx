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
  PRODUCT_TYPE_HELP,
  PRODUCT_TYPE_MAX,
  PRODUCT_TYPE_MIN,
  PRODUCT_YEAR_MIN,
  getProductYearMax,
} from "@/app/library/productValidation";

type ShelfProduct = {
  id: string;
  name: string;
  type: string;
  year: number;
};

type Shelf = {
  id: string;
  name: string;
  products: ShelfProduct[];
};

type ShelfCardProps = {
  shelf: Shelf;
  index: number;
  updateShelf: (formData: FormData) => Promise<void>;
  createProduct: (formData: FormData) => Promise<void>;
  updateProduct: (formData: FormData) => Promise<void>;
  deleteShelf: (formData: FormData) => Promise<void>;
};

export default function ShelfCard({
  shelf,
  index,
  updateShelf,
  createProduct,
  updateProduct,
  deleteShelf,
}: ShelfCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(shelf.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemYear, setItemYear] = useState(
    String(getProductYearMax() - 1),
  );
  const [editingProduct, setEditingProduct] = useState<ShelfProduct | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editYear, setEditYear] = useState(String(getProductYearMax() - 1));
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const formId = `edit-shelf-${shelf.id}`;
  const inputId = `${formId}-name`;
  const itemFormId = `add-item-${shelf.id}`;
  const itemNameId = `${itemFormId}-name`;
  const itemTypeId = `${itemFormId}-type`;
  const itemYearId = `${itemFormId}-year`;
  const editFormId = `edit-item-${shelf.id}`;
  const editNameId = `${editFormId}-name`;
  const editTypeId = `${editFormId}-type`;
  const editYearId = `${editFormId}-year`;

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
    setItemType("");
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
    setEditType(product.type);
    setEditYear(String(product.year));
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
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-muted sm:col-span-2" htmlFor={itemTypeId}>
                Type
                <input
                  id={itemTypeId}
                  name="type"
                  type="text"
                  required
                  minLength={PRODUCT_TYPE_MIN}
                  maxLength={PRODUCT_TYPE_MAX}
                  title={PRODUCT_TYPE_HELP}
                  value={itemType}
                  onChange={(event) => setItemType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                />
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
              {PRODUCT_NAME_HELP} Year must be between {PRODUCT_YEAR_MIN} and{" "}
              {getProductYearMax()}.
            </p>
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
                className="rounded-2xl border border-line bg-wash p-4 text-sm text-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                      {product.type}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Released {product.year}
                    </p>
                  </div>
                  <button
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-ink"
                    type="button"
                    onClick={() => startEditingItem(product)}
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label
                        className="text-xs text-muted sm:col-span-2"
                        htmlFor={editTypeId}
                      >
                        Type
                        <input
                          id={editTypeId}
                          name="type"
                          type="text"
                          required
                          minLength={PRODUCT_TYPE_MIN}
                          maxLength={PRODUCT_TYPE_MAX}
                          title={PRODUCT_TYPE_HELP}
                          value={editType}
                          onChange={(event) => setEditType(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
                        />
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
                      {PRODUCT_NAME_HELP} Year must be between{" "}
                      {PRODUCT_YEAR_MIN} and {getProductYearMax()}.
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
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
                  </form>
                </div>
              </div>,
              portalTarget,
            )
          : null}
    </section>
  );
}
