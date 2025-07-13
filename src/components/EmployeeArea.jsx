// src/components/EmployeeArea.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import EmployeeDashboard from './EmployeeDashboard';
import { auth } from '../firebase';

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
      <div className="login-container">
        <h2 className="text-2xl mb-6">Login do Funcionário</h2>
        <button onClick={handleLogin} className="login-button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-6 h-6 mr-3 bg-white rounded-full p-1"/>
          Entrar com Google
        </button>
      </div>
    );
  }

  return <EmployeeDashboard user={user} />;
}

export default EmployeeArea;