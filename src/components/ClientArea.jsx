import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import OrderStatus from './OrderStatus';
import { getMessaging, getToken } from 'firebase/messaging'; // Importar getMessaging e getToken
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Importar getFirestore, doc, setDoc

const db = getFirestore(); 

function ClientArea() {
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannedOrderId) {
      requestNotificationPermissionAndGetToken(scannedOrderId);
      return;
    }

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

  // Nova função para solicitar permissão e obter token
  const requestNotificationPermissionAndGetToken = async (orderId) => {
    try {
      const messaging = getMessaging(); // Obter instância do Messaging

      // Solicitar permissão de notificação
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Permissão para notificações concedida.');
        // Obter o token de registro do FCM
        // SUA CHAVE VAPID PÚBLICA:
        const currentToken = await getToken(messaging, { vapidKey: 'BGc3SfJ2W2yHwl-GeXjm1TGwQ5pDVimaExDZmihLfzeJlPh2OsI-PseqnOBaUUyHjiW06QMJ0c61CeXTcUV_t2M' });

        console.log('FCM Token:', currentToken);

        // Salvar o token no Firestore associado ao orderId
        // O token será salvo em uma coleção 'deviceTokens' com o orderId como ID do documento
        await setDoc(doc(db, "deviceTokens", orderId), {
          token: currentToken,
          timestamp: new Date()
        }, { merge: true }); // Usar merge para atualizar se já existir

      } else {
        console.warn('Permissão para notificações negada.');
      }
    } catch (error) {
      console.error('Erro ao obter token FCM ou salvar no Firestore:', error);
    }
  };

  if (!scannedOrderId) {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-2xl mb-4 text-gray-300">Aponte para o QR Code do seu pedido</h2>
        <div id="qr-reader" className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden"></div>
      </div>
    );
  }

  return <OrderStatus orderId={scannedOrderId} />;
}

export default ClientArea;
