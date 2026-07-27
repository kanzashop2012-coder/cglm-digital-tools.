/* CGLM Duty Log — service worker
   Caches the app shell so it opens without a connection.
   Attendance data always goes to the network: a stale record is worse than none. */
const VERSION = 'duty-log-v1.5.0';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/icon-32.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(VERSION)
      .then(c=>Promise.allSettled(SHELL.map(u=>c.add(u))))   // one missing icon must not fail the install
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message', e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache the database. Records must be live.
  if(/firebaseio|firebasedatabase|googleapis/.test(url.hostname)) return;

  // Firebase SDK from the CDN: use the cache, refresh in the background.
  if(url.hostname === 'www.gstatic.com'){
    e.respondWith(caches.open(VERSION).then(async c=>{
      const hit = await c.match(req);
      const net = fetch(req).then(r=>{ if(r.ok) c.put(req, r.clone()); return r; }).catch(()=>hit);
      return hit || net;
    }));
    return;
  }

  // Pages: network first so a redeploy lands immediately, cache as the fallback.
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(r=>{ const cp=r.clone(); caches.open(VERSION).then(c=>c.put('./index.html', cp)); return r; })
        .catch(()=>caches.match('./index.html').then(r=>r || caches.match('./')))
    );
    return;
  }

  // Everything else: cache first.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r=>{
      if(r.ok && url.origin === self.location.origin){
        const cp = r.clone(); caches.open(VERSION).then(c=>c.put(req, cp));
      }
      return r;
    }).catch(()=>hit))
  );
});
