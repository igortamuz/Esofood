// src/components/OrderStatus.jsx
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';
import { db, messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Função para solicitar permissão e obter o token FCM
async function requestPermissionAndGetToken(orderId) {
  console.log('Requesting permission...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Obtenha o token de registro do FCM
      const currentToken = await getToken(messaging, { vapidKey: 'BDI39AGJ5FU6Q2FODK1S3R4T5E6W7Y8U9I0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H' }); // Substitua com sua VAPID key do Firebase
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Salve o token no documento do pedido no Firestore
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { fcmToken: currentToken });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}

function OrderStatus({ orderId }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [showReadyAlert, setShowReadyAlert] = useState(false);

    useEffect(() => {
        // Solicita permissão e obtém o token assim que o componente é montado
        requestPermissionAndGetToken(orderId);

        const orderRef = doc(db, "orders", orderId);
        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                const orderData = { id: docSnap.id, ...docSnap.data() };
                if (order?.status !== 'ready' && orderData.status === 'ready') {
                    setShowReadyAlert(true);
                    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                }
                setOrder(orderData);
                setError(null);
            } else {
                setError("Pedido não encontrado. Verifique o QR Code.");
                setOrder(null);
            }
        });

        // Listener para mensagens em primeiro plano (quando o usuário está com a aba aberta)
        const unsubscribeOnMessage = onMessage(messaging, (payload) => {
            console.log('Mensagem em primeiro plano recebida:', payload);
            setShowReadyAlert(true);
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        });

        return () => {
            unsubscribe();
            unsubscribeOnMessage();
        };
    }, [orderId, order?.status]);

    const handleConfirmReceipt = async () => {
        const orderRef = doc(db, "orders", orderId);
        try {
            await updateDoc(orderRef, { status: 'delivered' });
        } catch (err) {
            console.error("Erro ao confirmar recebimento:", err);
        }
    };

    if (error) return <div className="status-card error">{error}</div>;
    if (!order) return <div className="status-card">Carregando status do pedido...</div>;

    if (order.status === 'delivered') {
        return (
            <div className="status-card delivered">
                <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
                <h2 className="text-3xl font-bold">Pedido Entregue!</h2>
                <p className="text-xl mt-2">Agradecemos a sua preferência, {order.clientName}!</p>
            </div>
        );
    }

    return (
        <div className="status-card-container">
            <div className="status-card">
                <h2 className="text-2xl mb-2">Olá, <span className="font-bold">{order.clientName}</span>!</h2>
                <p className="mb-6">Acompanhe o status do seu <span className="text-yellow-400">{order.combo}</span>:</p>

                <div className={`status-display ${order.status}`}>
                    {order.status === 'preparing' && 'Seu pedido está sendo preparado...'}
                    {order.status === 'ready' && 'Seu pedido está pronto para retirada!'}
                </div>

                {order.status === 'ready' && (
                    <button onClick={handleConfirmReceipt} className="confirm-receipt-button">
                        Já peguei meu lanche!
                    </button>
                )}
            </div>

            {showReadyAlert && (
                 <div className="modal-overlay">
                    <div className="modal-content ready-alert-modal">
                        <h3 className="text-4xl font-black mb-4">SEU PEDIDO ESTÁ PRONTO!</h3>
                        <p className="text-xl">Pode retirar seu pedido no balcão.</p>
                        <button onClick={() => setShowReadyAlert(false)} className="ready-alert-close-button">
                            Ok!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderStatus;