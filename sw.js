const CACHE_NAME = 'maestro-sports-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/canales.json',
  'https://vjs.zencdn.net/8.3.0/video-js.css',
  'https://vjs.zencdn.net/8.3.0/video.min.js'
];

// Instalar: Guardar los archivos en el teléfono
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activar: Limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
});

// Fetch: Prioridad a la red para el JSON, caché para el resto
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('canales.json')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((res) => {
        return res || fetch(e.request);
      })
    );
  }
});
