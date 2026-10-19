// 画面ファイルを端末に保存し、次回は通信を待たずに即表示する。裏で最新版を取得して次回に反映する。
// 記録データ（script.google.com）は保存しない。?nosw= 付きの確認用リクエストは素通しする。
const CACHE = 'jikan-shell';
const SHELL = ['./', './index.html', './icon.png?v=1'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.searchParams.has('nosw')) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    const network = fetch(event.request)
      .then(response => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
      .catch(() => cached);
    return cached || network;
  }));
});

// Web Pushの本文は一般的な記録忘れの案内だけ。予定名・実施内容は通知に含めない。
self.addEventListener('push', event => {
  let data={};try{data=event.data?event.data.json():{};}catch(e){}
  event.waitUntil(self.registration.showNotification(data.title||'時間の記録を忘れていませんか？',{
    body:data.body||'今していることを時間管理に記録しましょう。',
    icon:'./icon.png?v=1',badge:'./icon.png?v=1',tag:data.tag||'jikan-record-gap',
    data:{url:new URL('./',self.location.href).href}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target=new URL('./',self.location.href).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    const existing=windows.find(w=>w.url.startsWith(target));
    if(existing){await existing.focus();return;}
    return self.clients.openWindow(target);
  }));
});
