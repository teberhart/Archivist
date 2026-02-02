export default function LibraryLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="h-10 w-48 rounded-full bg-wash" />
        <div className="mt-12 space-y-6">
          <div className="h-6 w-32 rounded-full bg-wash" />
          <div className="h-10 w-64 rounded-full bg-wash" />
          <div className="h-4 w-80 rounded-full bg-wash" />
        </div>
        <div className="mt-10 grid gap-6">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="rounded-3xl border border-line bg-card p-6 shadow-sm"
            >
              <div className="h-6 w-24 rounded-full bg-wash" />
              <div className="mt-3 h-8 w-48 rounded-full bg-wash" />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-16 rounded-2xl border border-line bg-wash"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
