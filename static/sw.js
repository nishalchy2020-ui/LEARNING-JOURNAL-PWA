const CACHE_VERSION = "lj-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/journal.html",
  "/about.html",
  "/projects.html",
  "/static/css/style.css",
  "/static/js/script.js",
  "/static/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // only handle same-origin requests
  if (url.origin !== location.origin) return;

  // API route from Flask
  if (url.pathname === "/reflections") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // everything else
  event.respondWith(cacheFirst(event.request));
});
