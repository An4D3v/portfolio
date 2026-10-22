// Service worker do portfólio (PWA): guarda o essencial para abrir sem internet e,
// com internet, busca sempre a versão nova primeiro (o site muda a cada push).
const VERSAO = 'portfolio-v1';
const ESSENCIAL = [
  '/',
  '/styles.css',
  '/extensao.css',
  '/tema.js',
  '/analise.js',
  '/extensao.js',
  '/app.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/manifest-en.webmanifest',
  '/assets/ana-64.webp',
  '/assets/ana-acenando.webp',
  '/assets/ana-programando.webp',
  '/assets/ana-programando-128.webp',
  '/assets/previas/rumo.webp',
  '/assets/previas/alien.webp',
  '/assets/previas/notas.webp',
  '/assets/previas/trevo.webp',
  '/assets/icones/icone-192.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ESSENCIAL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  const url = new URL(pedido.url);
  // fora do cache: outros sites (status dos apps), a contagem de visitas e os vídeos (pedidos por pedaço)
  if (pedido.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/_vercel/') || url.pathname.endsWith('.mp4') || pedido.headers.has('range')) return;
  e.respondWith(fetch(pedido)
    .then((resposta) => {
      if (resposta.ok && resposta.type === 'basic') {
        const copia = resposta.clone();
        caches.open(VERSAO).then((c) => c.put(pedido, copia));
      }
      return resposta;
    })
    .catch(() => caches.match(pedido, { ignoreSearch: true })
      .then((guardada) => guardada || (pedido.mode === 'navigate' ? caches.match('/') : Response.error()))));
});
