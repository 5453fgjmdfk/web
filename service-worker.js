// 简单的Service Worker实现缓存策略
const CACHE_NAME = 'jiangmen-map-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/map.js',
  '/src/Background.jpg'
];

// 安装阶段
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 返回缓存或网络请求
        return response || fetch(event.request);
      })
  );
});
