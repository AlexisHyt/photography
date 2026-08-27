import type { Metadata } from "next";
import Link from "next/link";
import { confirmUnsubscribeAction } from "@/app/_lib/subscription.actions";
import { findSubscriberByToken } from "@/app/_lib/subscribers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop receiving new photograph announcements.",
  robots: { index: false, follow: false },
};

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string; state?: string }>;
};

const CARD_CLASS =
  "overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <section className={CARD_CLASS}>
        <div className="relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_42%),linear-gradient(135deg,rgba(24,24,27,0.98),rgba(9,9,11,0.94))]" />
          <div className="relative space-y-5 p-8 lg:p-12">{children}</div>
        </div>
      </section>
    </main>
  );
}

function BackHome() {
  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur transition hover:bg-white/10"
    >
      Back to the gallery
    </Link>
  );
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token = "", state } = await searchParams;

  if (state === "removed") {
    return (
      <Shell>
        <p className="text-xs uppercase tracking-[0.4em] text-white/55">
          Unsubscribed
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          You are off the list.
        </h1>
        <p className="max-w-xl text-base leading-7 text-white/70">
          Your address has been removed. You will not receive any further
          announcements, and nothing of yours is kept.
        </p>
        <BackHome />
      </Shell>
    );
  }

  const subscriber = state === "unknown" ? null : await findSubscriberByToken(token);

  // A missing token also covers a link that was already used once.
  if (!subscriber) {
    return (
      <Shell>
        <p className="text-xs uppercase tracking-[0.4em] text-white/55">
          Nothing to do
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          This link is no longer valid.
        </h1>
        <p className="max-w-xl text-base leading-7 text-white/70">
          Either the address has already been removed, or the link was
          incomplete. Either way, there is no subscription left to cancel.
        </p>
        <BackHome />
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.4em] text-white/55">
        Unsubscribe
      </p>
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Stop the announcements?
      </h1>
      <p className="max-w-xl text-base leading-7 text-white/70">
        <span className="font-medium text-white">{subscriber.email}</span> will
        be removed from the notification list and deleted from the database.
      </p>
      <form action={confirmUnsubscribeAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white/90"
        >
          Yes, unsubscribe me
        </button>
        <BackHome />
      </form>
    </Shell>
  );
}
