navigator.serviceWorker.register('/sw.js').then(registration => {
});

Notification.requestPermission((...args) => {
    debugger
})