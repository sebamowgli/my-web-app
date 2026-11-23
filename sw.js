const CACHE = "wolyo-v11-1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 인터넷이 되면 항상 최신 파일을 받고, 안 될 때만 저장해 둔 파일을 보여줘요.
// 다른 사이트(Firebase, 글꼴)는 건드리지 않아요.
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(r, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match("./index.html")))
  );
});
