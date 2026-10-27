// Change this name every time index.html changes, so installed apps update.
const CACHE = "suivi-forme-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));

self.addEventListener("activate", e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // The page itself: network first, so a connected phone always gets the
  // latest version; the saved copy is used only when offline.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => { const x = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", x)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Icons, manifest: cache first.
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      const x = r.clone(); caches.open(CACHE).then(k => k.put(e.request, x)); return r;
    }))
  );
});
