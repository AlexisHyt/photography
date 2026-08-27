"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { AdminSubmitButton } from "@/app/_components/admin-submit-button";
import { subscribeAction } from "@/app/_lib/subscription.actions";
import { SUBSCRIPTION_FORM_INITIAL_STATE } from "@/app/_lib/subscription.form-state";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SubscribeButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const emailId = useId();
  const [state, formAction] = useActionState(
    subscribeAction,
    SUBSCRIPTION_FORM_INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Get notified about new photographs"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition hover:scale-105 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:bottom-6 sm:right-6"
      >
        <BellIcon />
      </button>

      <dialog
        ref={dialogRef}
        // The native dialog already handles Escape and focus trapping; this
        // only adds the click-outside-to-close that it does not provide.
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close();
          }
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl border border-zinc-200 bg-white p-0 text-zinc-900 [&::backdrop]:bg-black/60 [&::backdrop]:backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <div className="space-y-5 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                Stay posted
              </p>
              <h2 className="text-xl font-semibold">
                Get an email for every new photograph
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Leave your address and the site will email you every time a new
            image is published, with a preview and a link to the collection. No
            other use, and every email carries a one-click unsubscribe link.
            Don't worry, I'll not upload 10 images per day :D
          </p>

          <form ref={formRef} action={formAction} className="space-y-3">
            <label
              htmlFor={emailId}
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Email address
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />

            <AdminSubmitButton
              idleLabel="Notify me"
              pendingLabel="Signing up..."
              className="w-full rounded-full bg-zinc-950 px-5 py-3 mt-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90"
            />

            {state.message ? (
              <p
                role="status"
                className={`text-sm leading-6 ${
                  state.status === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {state.message}
              </p>
            ) : null}
          </form>
        </div>
      </dialog>
    </>
  );
}
