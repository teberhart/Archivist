"use client";

import { FormEvent } from "react";

type DeleteShelfFormProps = {
  shelfId: string;
  action: (formData: FormData) => Promise<void>;
};

export default function DeleteShelfForm({
  shelfId,
  action,
}: DeleteShelfFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!window.confirm("Are you sure you want to delete this shelf?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="shelfId" value={shelfId} />
      <button
        className="rounded-full border border-rose-200 bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-200"
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}
