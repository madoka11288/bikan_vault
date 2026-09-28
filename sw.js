/* わたしの美術館 — service worker
   方針:
     ・アプリの殻(HTML/マニフェスト/アイコン)は先に確保し、オフラインでも開けるようにする
     ・CDNの書体と地図ライブラリは使った分だけ溜めておく
     ・Googleの認証とドライブAPIは絶対に触らない(常にネットへ)
   */
const V = 'bikan-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
const CDN = ['fonts.googleapis.com','fonts.gstatic.com','unpkg.com'];
const TILES = 'tile.openstreetmap.org';
const MAX_RUNTIME = 120, MAX_TILES = 90;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(SHELL.map(u => c.add(new Request(u, {cache:'reload'})).catch(()=>{})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function trim(cache, max){
  try{
    const keys = await cache.keys();
    if (keys.length > max) for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
  }catch(e){}
}

async function networkFirst(req){
  const c = await caches.open(V);
  try{
    const res = await fetch(req);
    if (res && res.ok) c.put(req, res.clone()).catch(()=>{});
    return res;
  }catch(e){
    const hit = await c.match(req, {ignoreSearch:true});
    if (hit) return hit;
    const shell = await c.match('./index.html');
    return shell || new Response('<h1>オフラインです</h1>', {status:503, headers:{'Content-Type':'text/html; charset=utf-8'}});
  }
}

async function cacheFirst(req, max){
  const c = await caches.open(V);
  const hit = await c.match(req, {ignoreSearch:false});
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')){ c.put(req, res.clone()).then(()=>trim(c, max)).catch(()=>{}); }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch(err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  /* 認証とドライブは素通し — キャッシュすると事故になる */
  if (url.hostname.endsWith('googleapis.com')) return;
  if (url.hostname.endsWith('accounts.google.com')) return;
  if (url.hostname.endsWith('gstatic.com') && url.pathname.indexOf('/accounts/') === 0) return;
  /* 動画の埋め込みは触らない */
  if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com') || url.hostname.endsWith('ytimg.com')) return;

  if (req.mode === 'navigate'){ e.respondWith(networkFirst(req)); return; }
  if (url.origin === self.location.origin){ e.respondWith(cacheFirst(req, MAX_RUNTIME)); return; }
  if (CDN.indexOf(url.hostname) >= 0){ e.respondWith(cacheFirst(req, MAX_RUNTIME)); return; }
  if (url.hostname.endsWith(TILES)){ e.respondWith(cacheFirst(req, MAX_TILES)); return; }
});
