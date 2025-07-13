// src/components/OrderStatus.jsx
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { CheckCircle, Sandwich, ChefHat } from 'lucide-react';

const db = getFirestore();

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
                    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
                }
                setOrder(orderData);
                setError(null);
            } else {
                setError("Pedido não encontrado. Verifique o QR Code ou fale com um atendente.");
                setOrder(null);
            }
        }, (err) => {
            console.error("Erro no listener do pedido:", err);
            setError("Não foi possível carregar o status do pedido. Verifique sua conexão.");
        });
        return () => unsubscribe();
    }, [orderId, order?.status]);

    const handleConfirmReceipt = async () => {
        const orderRef = doc(db, "orders", orderId);
        try {
            await updateDoc(orderRef, { status: 'delivered' });
            setShowReadyAlert(false); // Garante que o modal feche
        } catch (err) {
            console.error("Erro ao confirmar recebimento:", err);
            alert("Não foi possível confirmar o recebimento. Tente novamente.");
        }
    };

    if (error) return <div className="status-card error">{error}</div>;
    if (!order) return <div className="status-card">Carregando status do pedido...</div>;

    if (order.status === 'delivered') {
        return (
            <div className="status-card delivered">
                <CheckCircle size={64} className="mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Pedido Entregue!</h2>
                <p className="text-xl mt-2">Bom apetite, <span className="client-name">{order.clientName}</span>!</p>
            </div>
        );
    }

    return (
        <div className="client-area-container">
            <div className="status-card">
                <h2 className="text-2xl mb-2">Olá, <span className="client-name">{order.clientName}</span>!</h2>
                <p className="mb-6 text-lg">Acompanhe o status do seu <span className="font-semibold">{order.combo}</span>:</p>

                <div className={`status-display ${order.status}`}>
                    {order.status === 'preparing' && <><ChefHat className="inline mr-2" /><span>Seu pedido está sendo preparado...</span></>}
                    {order.status === 'ready' && <><Sandwich className="inline mr-2" /><span>Seu pedido está pronto para retirada!</span></>}
                </div>

                {order.status === 'ready' && (
                    <button onClick={handleConfirmReceipt} className="confirm-receipt-button">
                        Já peguei meu lanche!
                    </button>
                )}
            </div>

            {showReadyAlert && (
                 <div className="modal-overlay ready-alert-modal">
                    <div className="modal-content">
                        <h3 className="ready-alert-title">SEU PEDIDO ESTÁ PRONTO!</h3>
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