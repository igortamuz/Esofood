import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import EmployeeDashboard from "./EmployeeDashboard"; // Certifique-se de que o caminho está correto

const auth = getAuth();

function EmployeeArea() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setError(null); // Limpa erros ao mudar o estado do usuário
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setError(
        "Falha no login com Google. Verifique suas credenciais e permissões."
      );
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro ao fazer login com e-mail/senha:", error);
      let errorMessage = "Falha no login. Verifique seu e-mail e senha.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "E-mail ou senha inválidos.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Formato de e-mail inválido.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Muitas tentativas de login. Tente novamente mais tarde.";
      }
      setError(errorMessage);
    }
  };

  if (!user) {
    return (
      <div className="login-wrapper"> {/* Aplicado a classe login-wrapper */}
        <h2 className="login-title">Login do Funcionário</h2> {/* Aplicado a classe login-title */}
        {error && <p className="login-error">{error}</p>}{" "}
        {/* Nova classe para erros */}
        <form onSubmit={handleEmailLogin} className="login-form"> {/* Nova classe para o formulário */}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input-field"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input-field"
            required
          />
          <button type="submit" className="login-button email-login-button"> {/* Nova classe combinada */}
            Entrar com E-mail e Senha
          </button>
        </form>
        <div className="login-separator">- OU -</div> {/* Nova classe para o separador */}
        <button onClick={handleGoogleLogin} className="login-button google-login-button"> {/* Nova classe combinada */}
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google icon"
          />
          Entrar com Google
        </button>
      </div>
    );
  }

  return <EmployeeDashboard user={user} />;
}

export default EmployeeArea;