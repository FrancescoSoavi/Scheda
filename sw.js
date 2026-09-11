const CACHE = 'fb16-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
self.addEventListener('activate', e=>{ e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
); });
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  if(isDoc){
    e.respondWith(
      fetch(e.request).then(resp=>{ const c=resp.clone(); caches.open(CACHE).then(k=>k.put('./index.html', c)); return resp; })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp=>{
      const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
