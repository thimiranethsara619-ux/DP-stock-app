var CACHE_NAME = 'dp-stock-v5-1';

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
  var url = e.request.url;
  
  // ============================================
  // ⚠️ Apps Script requests — cache කරන්න එපා
  // ============================================
  if (url.indexOf('script.google.com') !== -1) {
    // Cache bypass — network එකෙන් කෙලින්ම ගන්න
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
    );
    return;
  }
  
  // ============================================
  // ⚠️ Google requests — cache කරන්න එපා
  // ============================================
  if (url.indexOf('google.com') !== -1 || url.indexOf('googleapis.com') !== -1) {
    return;
  }
  
  // ============================================
  // ⚠️ POST requests — cache කරන්න එපා
  // ============================================
  if (e.request.method !== 'GET') {
    return;
  }
  
  // ============================================
  // අනිත් ඔක්කොම (HTML, CSS, JS, Images) — cache
  // ============================================
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
