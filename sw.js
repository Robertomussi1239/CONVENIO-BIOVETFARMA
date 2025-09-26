// sw.js — PWA para GitHub Pages em subpasta
// - usa caminhos RELATIVOS
// - não intercepta chamadas ao script.google.com (API do Apps Script)

const VERSION = 'biovetfarma-v7'; // mude quando publicar para forçar atualização
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './assets/logo.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './app.js',
  './api.js',
  './firebase-config.js'
];

// Instala e coloca em cache os assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS))
  );
});

// Remove versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
});

// Estratégia: cache-first para assets locais; rede para API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas ao Google Apps Script
  if (url.hostname === 'script.google.com') {
    return; // deixa ir direto para a rede
  }

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
