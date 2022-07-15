const staticCacheName = 'site-static-v1.1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
  '/pwa-app/',
  '/pwa-app/index.html',
  '/pwa-app/assets/js/script.js',
  '/pwa-app/assets/js/ui.js',
  '/pwa-app/assets/js/materialize.min.js',
  '/pwa-app/assets/css/style.css',
  '/pwa-app/assets/css/materialize.min.css',
  '/pwa-app/assets/img/icon.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/pwa-app/pages/fallback.html',
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install sw
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching all assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== staticCacheName && key !== dynamicCacheName).map((key) => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(e.request).then((fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(e.request.url, fetchRes.clone());
              limitCacheSize(dynamicCacheName, 15);
              return fetchRes;
            });
          })
        );
      })
      .catch(() => {
        if (e.request.url.indexOf('.html') > -1) {
          return caches.match('/pwa-app/pages/fallback.html');
        }
      })
  );
});
