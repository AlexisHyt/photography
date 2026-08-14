export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="animate-pulse space-y-6 bg-zinc-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="h-3 w-40 rounded-full bg-white/15" />
          <div className="space-y-3">
            <div className="h-10 w-72 rounded-2xl bg-white/15" />
            <div className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
            <div className="h-4 w-3/4 max-w-xl rounded-full bg-white/10" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
            <div className="h-24 rounded-2xl bg-white/10" />
            <div className="h-24 rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="space-y-4 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from(
                { length: 12 },
                (_, index) => `skeleton-${index}`,
              ).map((key) => (
                <div
                  key={key}
                  className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
