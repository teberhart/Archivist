"use client";

type ProductTypeItem = {
  id: string;
  name: string;
};

type AdminProductTypesProps = {
  types: ProductTypeItem[];
  addProductType: (formData: FormData) => Promise<void>;
  removeProductType: (formData: FormData) => Promise<void>;
};

export default function AdminProductTypes({
  types,
  addProductType,
  removeProductType,
}: AdminProductTypesProps) {
  return (
    <section className="mt-8 rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Product types
          </p>
          <h2 className="mt-2 text-2xl font-[var(--font-display)]">
            Media type options
          </h2>
          <p className="mt-2 text-sm text-muted">
            Control the allowed values for product media type selections.
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3" action={addProductType}>
        <input
          name="name"
          type="text"
          placeholder="Add a new type"
          className="w-full max-w-xs rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-ink"
          required
        />
        <button
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-strong"
          type="submit"
        >
          Add type
        </button>
      </form>

      {types.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No media types are defined yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {types.map((type) => (
            <li
              key={type.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-wash px-4 py-3 text-sm"
            >
              <span className="font-semibold text-ink">{type.name}</span>
              <form
                action={removeProductType}
                onSubmit={(event) => {
                  if (!window.confirm(`Remove the type "${type.name}"?`)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="typeId" value={type.id} />
                <button
                  className="rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-200"
                  type="submit"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
