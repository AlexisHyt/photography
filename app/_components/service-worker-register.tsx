"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Dev chunks are not content hashed, so letting the worker cache them would
    // serve stale modules and break fast refresh. Test the PWA with a production
    // build (`bun run build && bun run start`).
    //
    // A production build tested on localhost registers the worker on the same
    // origin the dev server uses, and the registration outlives it — so tear it
    // down here rather than merely declining to create one.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });

      void caches?.keys().then((keys) => {
        for (const key of keys) {
          void caches.delete(key);
        }
      });

      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  }, []);

  return null;
}
