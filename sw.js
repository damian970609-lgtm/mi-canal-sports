const CACHE_NAME = 'maestro-sports-v1';
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

// Fetch: Servir archivos desde caché si no hay internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
