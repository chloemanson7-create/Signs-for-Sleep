// Signs for Sleep — service worker
// Caches the app shell (HTML/JS/CSS/icons) so the app opens instantly and
// works offline. Deliberately does NOT cache anything from Supabase (or any
// other cross-origin request) — client data must always come fresh from the
// network, never from a stale cache.

const CACHE_NAME = "sfs-shell-v1"; // bump this string any time you want to force everyone onto a fresh cache

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever handle same-origin GET requests — everything else (Supabase
  // calls, POST/PUT/DELETE, other domains) passes straight through untouched.
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Page navigations: always try the network first so users get the latest
  // deployed build; fall back to a cached shell if they're offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Static assets (JS/CSS/icons): cache-first for speed, refill the cache in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
