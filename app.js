function serviceWorker(){
    if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js', { scope: '/SuperTNT_web_version/' });
    }
}
