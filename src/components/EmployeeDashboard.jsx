// src/components/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { LogOut, CheckCircle, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import OrderList from './OrderList';
import { db, auth } from '../firebase';

function EmployeeDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ clientName: '', combo: 'Combo Simples' });
  const [qrCodeOrder, setQrCodeOrder] = useState(null);

  const combos = ['Combo Simples', 'Combo Duplo', 'Combo Família', 'Combo Vegano'];

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersData.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.clientName.trim() === '') {
      alert("Por favor, insira o nome do cliente.");
      return;
    }
    try {
      await addDoc(collection(db, "orders"), {
        ...newOrder,
        status: 'preparing',
        createdAt: serverTimestamp()
      });
      setNewOrder({ clientName: '', combo: 'Combo Simples' });
    } catch (error) {
      console.error("Erro ao criar pedido: ", error);
      alert("Falha ao criar o pedido. Verifique as regras do Firebase e a conexão.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, { status });
      // TODO: Se você tiver um backend, aqui é onde seu backend seria notificado para enviar
      // uma notificação push para o cliente cujo pedido mudou de status para 'ready'.
      // Isso NÃO é feito diretamente pelo frontend para notificações web push que
      // devem ser entregues quando o aplicativo está em segundo plano ou fechado.
    } catch (error) {
      console.error("Erro ao atualizar status do pedido: ", error);
    }
  };

  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p>Bem-vindo, <span className="font-bold text-yellow-300">{user.displayName}</span>!</p>
        <button onClick={handleLogout} className="logout-button">
          <LogOut className="mr-2" size={20}/>
          Sair
        </button>
      </div>

      <div className="card">
        <h3 className="card-title">Criar Novo Pedido</h3>
        <form onSubmit={handleCreateOrder} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newOrder.clientName}
            onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
            placeholder="Nome do Cliente"
            className="input-field"
          />
          <select
            value={newOrder.combo}
            onChange={(e) => setNewOrder({ ...newOrder, combo: e.target.value })}
            className="input-field"
          >
            {combos.map(combo => <option key={combo} value={combo}>{combo}</option>)}
          </select>
          <button type="submit" className="add-order-button">
            Adicionar Pedido
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <OrderList
          title="Pedidos em Preparo"
          orders={preparingOrders}
          icon={<Clock className="text-yellow-400" />}
          actions={[
            { label: 'Pronto', handler: (id) => updateOrderStatus(id, 'ready'), color: 'green' },
            { label: 'Gerar QR', handler: (order) => setQrCodeOrder(order), color: 'blue' }
          ]}
        />
        <OrderList
          title="Pedidos Entregues Hoje"
          orders={deliveredOrders}
          icon={<CheckCircle className="text-green-400" />}
        />
      </div>

      {qrCodeOrder && (
        <div className="modal-overlay" onClick={() => setQrCodeOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-2">Pedido de {qrCodeOrder.clientName}</h3>
            <p className="mb-4">Apresente este QR Code ao cliente.</p>
            <div className="p-4 bg-white rounded-lg">
                <QRCodeCanvas value={qrCodeOrder.id} size={256} />
            </div>
            <button onClick={() => (setQrCodeOrder(null))} className="modal-close-button">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;