var CACHE_NAME = 'dp-stock-v4-1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['./', './index.html']);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // ⚠️ POST requests cache කරන්න එපා
  // ⚠️ Apps Script requests cache කරන්න එපා
  // ⚠️ Script.google.com requests cache කරන්න එපා
  
  var url = e.request.url;
  
  // POST requests — cache bypass
  if (e.request.method !== 'GET') {
    return; // fetch default behavior
  }
  
  // Apps Script requests — cache bypass
  if (url.indexOf('script.google.com') !== -1) {
    return;
  }
  
  // Google requests — cache bypass
  if (url.indexOf('google.com') !== -1) {
    return;
  }
  
  // අනිත් ඔක්කොම — cache
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Error responses cache කරන්න එපා
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      var responseClone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, responseClone);
      });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
