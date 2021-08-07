const CACHE_NAME = "static-cache-v-1";
const DATA_CACHE_NAME = "data-cache-v-1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/style.css",
    "/assets/js/db.js",
    "/assets/js/index.js",
    "/manifest.webmanifest",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
});
  

self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
});
  

self.addEventListener("fetch", function(evt) {
  
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );


});