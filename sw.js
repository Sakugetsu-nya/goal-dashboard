const CACHE = 'goal-mgr-pwa-cdb1c2080ef7';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './brand-logo.png'];

self.addEventListener('install', event => {
  // 立即允许激活，不再等 precache 完成，使「发现新版本」弹窗尽快触发
  self.skipWaiting();
  // 预缓存放在后台静默进行，失败也不阻塞
  caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {});
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      fetch(event.request)
        .then(resp => {
          const copy = resp.clone();
          cache.put(event.request, copy);
          return resp;
        })
        .catch(() => cache.match(event.request))
        .catch(() => cache.match('./index.html'))
    )
  );
});
