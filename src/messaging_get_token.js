importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '900418340819'
});

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
 console.log('[firebase-messaging-sw.js] Received background message ', payload);
 const notificationTitle = 'Background Message from html';
  const notificationOptions = {
   body: 'Background Message body.',
   icon: '/firebase-logo.png'
 };

  return self.registration.showNotification(notificationTitle,
     notificationOptions);
});



// const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(function(payload) {
//     console.log(
//         "[firebase-messaging-sw.js] Received background message ",
//         payload,
//     );
//     // Customize notification here
//     const notificationTitle = "Background Message Title";
//     const notificationOptions = {
//         body: "Background Message body.",
//         icon: "/itwonders-web-logo.png",
//     };

//     return self.registration.showNotification(
//         notificationTitle,
//         notificationOptions,
//     );
// });