importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // TODO: Se deben inyectar las variables o poner aquí al hacer el build final
  // Debido a que los SW no pueden acceder a process.env directamente, 
  // usualmente se reemplazan en build-time con webpack.
};

if (Object.keys(firebaseConfig).length > 0) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/globe.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
