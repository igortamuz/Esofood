// public/firebase-messaging-sw.js
/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */
/* global firebase:readonly */

// Importe o Firebase JS SDK de forma compatível com Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAtmM-ml7LJsUhQWNLd8uT9KG-nx2-2cUs",
  authDomain: "esafood-d8508.firebaseapp.com",
  projectId: "esafood-d8508",
  storageBucket: "esafood-d8508.firebasestorage.app",
  messagingSenderId: "528934758817",
  appId: "1:528934758817:web:8bb5702db74e4f358d03e0"
};

// Inicialize o Firebase no Service Worker
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app); // Obtenha a instância de messaging

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem em segundo plano recebida:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log('Service Worker: Evento de instalação. Pulando espera...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Evento de ativação. Reivindicando clientes...');
  event.waitUntil(clients.claim());
});

console.log('Service Worker: Arquivo carregado.');