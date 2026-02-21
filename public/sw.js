const STATIC_CACHE_NAME = 'intotheheaven-static-v2'
const DYNAMIC_CACHE_NAME = 'intotheheaven-dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(name => {
            if (name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME) {
              return caches.delete(name)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests (e.g., R2 media URLs) — let the browser handle them directly
  if (url.origin !== self.location.origin) {
    return
  }

  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request))
    return
  }

  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  )
})

async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    throw new Error('Network response not ok')
  } catch {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    const fallback = await caches.open(STATIC_CACHE_NAME).then(c => c.match('/'))
    if (fallback) return fallback

    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>오프라인</title><style>body{font-family:system-ui;padding:2rem;text-align:center}.icon{font-size:4rem;margin-bottom:1rem}</style></head><body><div class="icon">📴</div><h1>오프라인 상태입니다</h1><p>인터넷 연결을 확인해 주세요.</p><button onclick="location.reload()">다시 시도</button></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}

async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    throw new Error('Failed to fetch static asset')
  } catch {
    return new Response('', { status: 404 })
  }
}

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
  }
  event.waitUntil(self.registration.showNotification('IntoTheHeaven', options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
