// src/components/OrderStatus.jsx
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CheckCircle } from 'lucide-react';
import { db } from '../firebase';

function OrderStatus({ orderId }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [showReadyAlert, setShowReadyAlert] = useState(false);

    useEffect(() => {
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
        return () => unsubscribe();
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
                    <div className="ready-alert-modal">
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