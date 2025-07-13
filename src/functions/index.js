import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { messaging } from "./firebase"; 
import { onMessage } from "firebase/messaging";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registrado com sucesso:", registration);

      onMessage(messaging, (payload) => {
        console.log("Mensagem em primeiro plano recebida:", payload);
        alert(
          `Novo pedido: ${payload.notification.title} - ${payload.notification.body}`
        );
      });
    })
    .catch((error) => {
      console.error("Falha no registro do Service Worker:", error);
    });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
