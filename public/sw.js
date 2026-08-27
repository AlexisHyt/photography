// Bump the version to invalidate every cache this worker owns.
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;

const OFFLINE_URL = "/offline";
const SHELL_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Routes the worker must never touch:
// - /api and /studio-console are authenticated and must always hit the network;
// - /_next/image proxies presigned MinIO URLs, so its cache keys are unique per
//   request and the underlying signatures expire. Caching them only wastes quota.
const BYPASS = [/^\/api\//, /^\/studio-console/, /^\/_next\/image/];

const CACHEABLE_ASSET = /\.(?:css|js|woff2?|svg|png|ico|webmanifest)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Pages are rendered dynamically and embed presigned image URLs, so serving a
// cached document would show expired images. Navigations stay network-only and
// fall back to the offline page.
async function networkOnlyWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return (
      offline ??
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

// Build output under /_next/static is content hashed, so a hit is always valid.
async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached ?? network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (BYPASS.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkOnlyWithOfflineFallback(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (CACHEABLE_ASSET.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
