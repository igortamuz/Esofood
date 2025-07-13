// src/App.jsx
import React, { useState } from 'react';
import { Home, UtensilsCrossed } from 'lucide-react';
import HomePage from './components/HomePage';
import EmployeeArea from './components/EmployeeArea';
import ClientArea from './components/ClientArea';
import './styles/App.css';

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div className="app-container">
      <div className="container mx-auto p-4 max-w-7xl"> {/* Added max-w-7xl for better content width control */}
        <header className="app-header">
          <h1 className="app-title">
            <UtensilsCrossed className="mr-3" />
            EsaFood
          </h1>
          {view !== 'home' && (
            <button
              onClick={() => setView('home')}
              className="home-button"
            >
              <Home className="mr-2" size={20} />
              Início
            </button>
          )}
        </header>

        <main className="flex justify-center items-center py-8"> {/* Centralize content in main */}
          {view === 'home' && <HomePage setView={setView} />}
          {view === 'employee' && <EmployeeArea />}
          {view === 'client' && <ClientArea />}
        </main>
      </div>
    </div>
  );
}