// src/components/ClientArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import OrderStatus from './OrderStatus';
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase'; // Importa o messaging do seu firebase.js centralizado

function ClientArea() {
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const scannerRef = useRef(null);
  const [notificationStatus, setNotificationStatus] = useState('default'); // 'default', 'granted', 'denied', 'unsupported'

  useEffect(() => {
    // Check notification permission on component mount
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('unsupported');
    }

    if (scannedOrderId) return;

    const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
        setScannedOrderId(decodedText);
        scanner.clear().catch(error => console.error("Falha ao limpar o scanner.", error));
    };

    const onScanFailure = (error) => { /* Ignorar falhas */ };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
        if (scannerRef.current && scannerRef.current.getState() !== 2) { // 2 === NOT_STARTED
             scannerRef.current.clear().catch(err => console.error("Cleanup failed", err));
        }
    };
  }, [scannedOrderId]);

  const requestNotificationPermission = async () => {
    if (notificationStatus === 'unsupported') {
      alert('Seu navegador não suporta notificações.');
      return;
    }

    if (notificationStatus === 'denied') {
      alert('As notificações foram bloqueadas. Por favor, habilite-as nas configurações do seu navegador.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        const currentToken = await getToken(messaging, { vapidKey: 'BGg05uC-3S73U-J9a3UaB3V8z1z8d3C7e7V9C9M9X7E7I7Z7F7G7H7J7K7L7M9N7O7P7Q7R7S7T7U7V7W7X7Y7Z' }); // Substitua pelo seu VAPID key real
        // ATENÇÃO: Substitua 'BGg05uC-3S73U-J9a3UaB3V8z1z8d3C7e7V9C9M9X7E7I7Z7F7G7H7J7K7L7M9N7O7P7Q7R7S7T7U7V7W7X7Y7Z'
        // pelo seu VAPID Key do Firebase Console > Project settings > Cloud Messaging > Web configuration.
        // Ele estará na seção "Web push certificates".

        if (currentToken) {
          console.log('FCM Token:', currentToken);
          // AQUI: Você deve enviar este `currentToken` para o seu backend
          // para que seu servidor possa usá-lo para enviar notificações
          // associando-o ao ID do cliente ou ID do pedido se for o caso.
          // Exemplo (apenas conceito, você precisaria de um endpoint no seu backend):
          /*
          await fetch('/api/save-fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentToken, orderId: scannedOrderId }) // Enviar junto com o ID do pedido se houver
          });
          */
          alert('Notificações habilitadas com sucesso!');
        } else {
          console.log('Nenhum token de registro disponível. Habilite as notificações.');
          alert('Não foi possível obter o token de notificação.');
        }
      } else {
        console.log('Permissão de notificação negada.');
        alert('Permissão para notificações negada.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      alert('Erro ao habilitar notificações.');
    }
  };

  if (!scannedOrderId) {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-2xl mb-4 text-gray-300">Aponte para o QR Code do seu pedido</h2>
        <div id="qr-reader" className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden"></div>
        {notificationStatus !== 'granted' && notificationStatus !== 'unsupported' && (
          <button onClick={requestNotificationPermission} className="confirm-receipt-button mt-4">
            Habilitar Notificações de Pedido
          </button>
        )}
        {notificationStatus === 'granted' && (
          <p className="text-green-400 mt-4">Notificações habilitadas!</p>
        )}
      </div>
    );
  }

  return <OrderStatus orderId={scannedOrderId} />;
}

export default ClientArea;