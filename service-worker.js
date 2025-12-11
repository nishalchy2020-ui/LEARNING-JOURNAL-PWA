// Name of the cache
const CACHE_NAME = "journal-pwa-v1";

// Files to cache (adjust if filenames differ)
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./journal.html",
  "./projects.html",
  "./about.html",
  "./css/style.css",
  "./js/script.js",
  "./manifest.json"
];

// Install: pre-cache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: remove old caches when we update CACHE_NAME
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch: cache-first for static files, network-first for reflections API
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // If this is your Flask API for reflections, use network-first
  if (url.pathname.endsWith("/reflections")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Default behaviour: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
