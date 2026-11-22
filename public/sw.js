/* NakuruHub service worker — version bump invalidates caches */
const CACHE_VERSION = "nakuruhub-shell-v4";
const PRECACHE_URLS = [
  "/offline-fallback.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/logo-mark.png",
  "/icons/favicon-32.png",
  "/fonts/bricolage-grotesque-latin.woff2",
  "/fonts/figtree-latin.woff2",
];

const NEVER_CACHE = ["/api/", "/auth/"];

function shouldSkipCache(pathname) {
  return NEVER_CACHE.some((prefix) => pathname.startsWith(prefix));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const fresh = await fetch(request);
    if (fresh.ok && request.method === "GET") {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shell = await cache.match("/app");
    if (shell) return shell;
    return cache.match("/offline-fallback.html");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached ?? fetchPromise ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.method !== "GET") return;
  if (shouldSkipCache(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(woff2|png|svg|webmanifest|css|js)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});