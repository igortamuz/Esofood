// src/components/OrderStatus.jsx (APENAS PARA DEMONSTRAR O POLLING - NÃO É PUSH REAL)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';
// import { db, messaging } from '../firebase'; // Remover 'messaging' se não for usar push
import { db } from '../firebase'; // Mantenha apenas 'db'
// import { getToken, onMessage } from 'firebase/messaging'; // Remover se não for usar push

// A função requestPermissionAndGetToken e onMessage seriam removidas ou adaptadas
// para um cenário de polling puro sem push do servidor.
// Se você quer apenas polling e notificações locais, não precisaria de getToken ou onMessage aqui.

function OrderStatus({ orderId }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [showReadyAlert, setShowReadyAlert] = useState(false);

    useEffect(() => {
        const orderRef = doc(db, "orders", orderId);

        // O onSnapshot já é um listener em tempo real e é muito mais eficiente que polling manual.
        // Ele "ouve" as mudanças no Firestore e atualiza o estado automaticamente.
        // Se a notificação for gerada por onSnapshot, ela será local.
        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                const orderData = { id: docSnap.id, ...docSnap.data() };
                if (order?.status !== 'ready' && orderData.status === 'ready') {
                    setShowReadyAlert(true);
                    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                    // Aqui você poderia criar uma notificação local se o service worker estiver registrado
                    // e tiver permissão, mas sem uma Cloud Function, ela só aparecerá se o app estiver aberto.
                    if (Notification.permission === 'granted') {
                        new Notification('Seu pedido está pronto!', {
                            body: `Seu lanche de ${orderData.combo} está pronto para retirada.`,
                            icon: '/logo192.png'
                        });
                    }
                }
                setOrder(orderData);
                setError(null);
            } else {
                setError("Pedido não encontrado. Verifique o QR Code.");
                setOrder(null);
            }
        });

        // REMOVA A LÓGICA onMessage SE VOCÊ NÃO FOR USAR PUSH DE SERVIDOR
        // const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        //     console.log('Mensagem em primeiro plano recebida:', payload);
        //     setShowReadyAlert(true);
        //     if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        // });

        return () => {
            unsubscribe();
            // unsubscribeOnMessage(); // REMOVA SE NÃO USAR PUSH
        };
    }, [orderId, order?.status]); // Mantenha a dependência order?.status para reatividade do alerta

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