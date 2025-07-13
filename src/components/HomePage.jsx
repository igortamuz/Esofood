// src/components/HomePage.jsx
import React from 'react';
import { User, Users } from 'lucide-react';

function HomePage({ setView }) {
  return (
    <div className="home-page-wrapper">
      <h2 className="home-page-title">Bem-vindo ao EsaFood</h2>
      <p className="home-page-subtitle">Selecione sua área de acesso para começar</p>

      <div className="area-selection-wrapper">
        <button
          onClick={() => setView('client')}
          className="area-button client-button"
        >
          <User size={28} />
          Área do Cliente
        </button>
        <button
          onClick={() => setView('employee')}
          className="area-button employee-button"
        >
          <Users size={28} />
          Área do Funcionário
        </button>
      </div>
    </div>
  );
}

export default HomePage;