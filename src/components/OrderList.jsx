// src/components/OrderList.jsx
import React from 'react';

function OrderList({ title, orders, actions = [], icon }) {
  return (
    <div className="card">
      <h3 className="card-title">
        {icon}
        {title} ({orders.length})
      </h3>
      <div className="order-list-container">
        {orders.length === 0 ? (
          <p className="text-gray-400">Nenhum pedido nesta categoria.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className={`order-item ${order.status === 'ready' ? 'status-ready' : ''}`}>
              <div>
                <p className="client-name">{order.clientName}</p>
                <p className="combo-name">{order.combo}</p>
                {order.status === 'ready' && <p className="status-text">Pronto para retirada</p>}
              </div>
              <div className="order-actions">
                {actions.map(action => (
                   <button
                    key={action.label}
                    onClick={() => action.handler(action.label === 'Gerar QR' ? order : order.id)}
                    className={`action-button ${action.color}`}
                    disabled={order.status === 'ready' && action.label === 'Pronto'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderList;