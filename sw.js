self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    self.clients.claim();

});

navigator.permissions.query({name: 'notifications'}).then((...args) => {
    debugger
});