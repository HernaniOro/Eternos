// ═══════════════════════════════════════════════════════════════
// Mirabiles Service Worker — Full Offline Support
// Strategy: Cache-first for static assets, network-first for pages
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = "mirabiles-v1";

// Pre-cache essential shell on install
const BASE = "/Eternos";
const SHELL_URLS = [
  BASE + "/",
  BASE + "/explore",
  BASE + "/saved",
];

// ── INSTALL: cache app shell ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS);
    })
  );
  // Activate immediately (don't wait for old SW to die)
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Claim all open tabs immediately
  self.clients.claim();
});

// ── FETCH: smart caching strategy ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // ── Static assets (JS, CSS, images, fonts): Cache-first ──
  if (
    url.pathname.startsWith(BASE + "/_next/static/") ||
    url.pathname.startsWith(BASE + "/icons/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Pages/navigation: Network-first, fallback to cache ──
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(BASE + "/");
          });
        })
    );
    return;
  }

  // ── Everything else: Network-first with cache fallback ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
