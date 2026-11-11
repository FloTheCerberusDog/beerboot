// BeerBoot's service worker: keeps a copy of the app's own files so it opens with a weak signal.
// Strategy: always try the network first (so updates show straight away), and use the saved
// copy only when the network fails. Maps, search and walking directions are never cached here.

const CACHE = "beerboot-v1";
const SHELL = [
  "./", "index.html", "route.html", "create.html", "crawl.html",
  "styles.css", "manifest.webmanifest",
  "js/common.js", "js/home.js", "js/route.js", "js/create.js", "js/crawl.js", "js/pwa.js",
  "data/routes.js", "data/path.js",
  "vendor/maplibre-gl-5.24.0.css",
  "icons/icon.svg", "icons/icon-192.png", "icons/apple-touch-icon.png"
];
// Libraries and fonts from other sites that the app can't start without.
const LIBRARY_HOSTS = ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const sameSite = url.origin === self.location.origin;
  const library = LIBRARY_HOSTS.includes(url.hostname);
  if (!sameSite && !library) return; // maps, search, routing: straight to the network

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
  );
});
