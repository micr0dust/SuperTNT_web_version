async function serviceWorker() {
    const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
}