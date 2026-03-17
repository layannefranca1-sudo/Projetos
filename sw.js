
const CACHE_NAME = 'service-pro-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx'
];

// Instalação: Cacheia os recursos essenciais imediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cacheando recursos principais');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Fetch: Cache First para Ativos, com Fallback para Rede e Cache Dinâmico
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET ou sejam extensões do chrome, etc.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna do cache se disponível
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede
      return fetch(event.request).then((response) => {
        // Verifica se a resposta é válida antes de colocar no cache
        if (!response || response.status !== 200 || response.type !== 'basic' && !event.request.url.includes('esm.sh') && !event.request.url.includes('gstatic.com') && !event.request.url.includes('lucide-react')) {
          // Se for uma requisição externa (CORS/Opaque) de fontes ou scripts conhecidos, vamos cachear mesmo assim
          if (event.request.url.includes('cdn.tailwindcss.com') || 
              event.request.url.includes('fonts.googleapis.com') || 
              event.request.url.includes('fonts.gstatic.com') ||
              event.request.url.includes('esm.sh')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        }

        // Cacheia novas requisições internas (mesma origem) dinamicamente
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Fallback offline caso a rede falhe e não tenha cache
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
