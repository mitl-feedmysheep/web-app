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

// 푸시 클릭 기록용 API 주소. 등록 시 ?api= 로 전달된다 (index.html).
// 치환되지 않은 값(%VITE_...%)이나 잘못된 값이면 SW 측 수집은 건너뛰고 앱 측 fallback(pd 쿼리)에 맡긴다.
// 절대 주소(https://...)와 같은 origin 상대 경로(/api) 모두 지원한다.
const API_BASE = (() => {
  const api = new URL(self.location.href).searchParams.get("api");
  if (!api || !(/^https?:\/\//.test(api) || api.startsWith("/"))) return null;
  return new URL(api, self.location.origin).href.replace(/\/+$/, "");
})();

// 알림 종류별 tag: 같은 tag의 알림은 새 알림이 이전 알림을 대체한다
function tagFor(data) {
  if (data.type === "DAILY_PRAYER") return "mitl-daily-prayer";
  if (data.type === "DAILY_READING") return "mitl-daily-reading";
  if (data.type) return "mitl-notification";
  // type이 없는 구버전 payload 호환
  return data.url?.startsWith("/reading") ? "mitl-daily-reading" : data.url === "/" ? "mitl-daily-prayer" : "mitl-notification";
}

self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "IntoTheHeaven", {
      ...(data.body && { body: data.body }),
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/prayers", deliveryId: data.deliveryId || null, type: data.type || null },
      tag: tagFor(data),
      renotify: true,
    })
  );
});

function recordClick(deliveryId) {
  if (!API_BASE || !deliveryId) return Promise.resolve();
  return fetch(API_BASE + "/push/deliveries/" + encodeURIComponent(deliveryId) + "/click", {
    method: "POST",
    keepalive: true,
  }).catch(() => {});
}

function openTarget(targetUrl) {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if (client.url.includes(self.location.origin) && "focus" in client) {
        client.postMessage({ type: "navigate", url: targetUrl });
        return client.focus();
      }
    }
    return self.clients.openWindow(targetUrl);
  });
}

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const targetUrl = data.url || "/prayers";
  // 화면 이동과 클릭 기록을 병렬로 — 기록 실패가 이동을 막지 않는다
  e.waitUntil(Promise.allSettled([openTarget(targetUrl), recordClick(data.deliveryId)]));
});
