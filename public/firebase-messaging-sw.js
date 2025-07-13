// public/firebase-messaging-sw.js
// Importe os scripts do Firebase SDK no Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js');

// Configuração do Firebase (precisa ser repetida aqui para o Service Worker)
const firebaseConfig = {
  apiKey: "AIzaSyAtmM-ml7LJsUhQWNLd8uT9KG-nx2-2cUs",
  authDomain: "esafood-d8508.firebaseapp.com",
  projectId: "esafood-d8508",
  storageBucket: "esafood-d8508.firebasestorage.app",
  messagingSenderId: "528934758817",
  appId: "1:528934758817:web:8bb5702db74e4f358d03e0"
};

// Inicialize o Firebase dentro do Service Worker
firebase.initializeApp(firebaseConfig);

// Obtenha a instância do Firebase Messaging
const messaging = firebase.messaging();

// Manipulador para mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem em segundo plano recebida:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Certifique-se de ter um ícone no diretório public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento de instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Evento de instalação. Pulando espera...');
  self.skipWaiting(); // Força o Service Worker a se tornar ativo imediatamente
});

// Evento de ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Evento de ativação. Reivindicando clientes...');
  event.waitUntil(clients.claim()); // Garante que o Service Worker assuma o controle dos clientes imediatamente
});

console.log('Service Worker: Arquivo carregado.'); // Para confirmar que o SW está sendo lido