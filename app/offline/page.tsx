import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Offline",
  description: "This page is unavailable while the connection is down.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_42%),linear-gradient(135deg,rgba(24,24,27,0.98),rgba(9,9,11,0.94))]" />
          <div className="relative space-y-6 p-8 lg:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-white/55">
              No connection
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              The gallery needs a network.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/70">
              Collections and photographs are loaded on demand, so they cannot
              be shown while you are offline. Reconnect and the portfolio will
              pick up right where it left off.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white/90"
            >
              Try again
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
