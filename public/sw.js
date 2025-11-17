
const CACHE_NAME = 'overmind-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/og-image.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Background sync for offline meeting data
self.addEventListener('sync', (event) => {
  if (event.tag === 'meeting-sync') {
    event.waitUntil(syncMeetingData());
  }
});

async function syncMeetingData() {
  try {
    // Get any pending meetings from IndexedDB and sync when online
    const meetings = await getOfflineMeetings();
    for (const meeting of meetings) {
      await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meeting),
      });
    }
    await clearOfflineMeetings();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Simplified offline storage functions
function getOfflineMeetings() {
  return new Promise((resolve) => {
    // In a real implementation, this would use IndexedDB
    resolve([]);
  });
}

function clearOfflineMeetings() {
  return new Promise((resolve) => {
    // In a real implementation, this would clear IndexedDB
    resolve();
  });
}
