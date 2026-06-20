const SHELL_CACHE = "mitl-shell-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.add("/index.html"))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// SPA 라우팅: 서버에 없는 경로(예: /prayers) 새로고침 시 index.html로 응답
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch("/index.html").catch(() => caches.match("/index.html"))
    );
  }
});

self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "IntoTheHeaven", {
      ...(data.body && { body: data.body }),
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/prayers" },
      tag: data.url?.startsWith("/reading") ? "mitl-daily-reading" : data.url === "/" ? "mitl-daily-prayer" : "mitl-notification",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || "/prayers";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.postMessage({ type: "navigate", url: targetUrl });
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
