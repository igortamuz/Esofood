// src/components/EmployeeArea.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import EmployeeDashboard from './EmployeeDashboard';

const auth = getAuth();

function EmployeeArea() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  if (!user) {
    return (
      <div className="login-wrapper">
        <h2 className="login-title">Acesso Funcionário</h2>
        <button onClick={handleLogin} className="login-button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Ícone do Google" />
          Entrar com Google
        </button>
      </div>
    );
  }

  return <EmployeeDashboard user={user} />;
}

export default EmployeeArea;