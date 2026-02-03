"use client";

import { useState } from "react";
import DeleteShelfForm from "@/app/library/DeleteShelfForm";
import {
  SHELF_NAME_HELP,
  SHELF_NAME_MAX,
  SHELF_NAME_MIN,
} from "@/app/library/shelfValidation";

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
  deleteShelf: (formData: FormData) => Promise<void>;
};

export default function ShelfCard({
  shelf,
  index,
  updateShelf,
  deleteShelf,
}: ShelfCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(shelf.name);
  const formId = `edit-shelf-${shelf.id}`;
  const inputId = `${formId}-name`;

  const startEditing = () => {
    setName(shelf.name);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setName(shelf.name);
    setIsEditing(false);
  };

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
          <button
            className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
            type="button"
          >
            Add item
          </button>
          <DeleteShelfForm shelfId={shelf.id} action={deleteShelf} />
        </div>
      </div>

      {isEditing ? (
        <p className="mt-2 text-xs text-muted">{SHELF_NAME_HELP}</p>
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
          ))
        )}
      </div>
    </section>
  );
}
