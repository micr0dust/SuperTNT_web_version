self.addEventListener('install', function(event){
    console.log('[SW] 安裝(Install) Service Worker!',event);
    event.waitUntil(
        caches.open('static')
                    .then(function (cache) {
                        cache.addAll([
                            '/',
                            '/index.html',
                            '/createjs-2015.11.26.min.js',
                            '/vb.js',
                            '/index.js',
                            '/images/4YtokZ.png',
                            '/images/vb_atlas_.png',
                            '/images/vb_atlas_2.png',
                            '/images/vb_atlas_3.png',
                            '/images/vb_atlas_4.png',
                            '/images/vb_atlas_5.png',
                            '/assets/bgm1.mp3',
                            '/assets/bgm4.mp3',
                            '/assets/bgm6.mp3',
                            '/assets/bgm8.mp3',
                            '/assets/explode1.mp3',
                            '/assets/explode2.mp3',
                            '/assets/explode3.mp3',
                            '/assets/explode4.mp3',
                            '/assets/fuse.mp3',
                            '/assets/point.mp3',
                            '/assets/dead.mp3'
                        ]);
                    })
    );
});
var CACHE_STATIC = 'static-v2.0';
var CACHE_DYNAMIC = 'dynamic-v1.0';
self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys()
            .then(function(keys){
                return Promise.all(keys.map(function(key){
                    if(key !== CACHE_STATIC &&
                        key !== CACHE_DYNAMIC){
                            console.log('[SW] 刪除舊的快取');
                            return caches.delete(key);
                        }
                }));
            })
    );
    return self.clients.claim();
});
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request)
            .then(function(response){
                //抓不到會拿到 null
                if(response){
                    return response;
                }else{
                    return fetch(event.request)
                        .then(function(res){
                            caches.open('dynamic')
                                .then(function(cache){
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        });
                }
            })
    )
});
self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
