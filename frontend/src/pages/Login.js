import { useState } from "react";

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const entrar = () => {
  if (usuario === "pedropaulo" && senha === "1122") {
    localStorage.setItem("logado", "true");
    localStorage.setItem("usuario", "pedropaulo");

    alert("Oi, Pepeu! te amo ❤️");

    onLogin();
  } 
  
  else if (usuario === "marianafig" && senha === "2301") {
    localStorage.setItem("logado", "true");
    localStorage.setItem("usuario", "marianafig");

    onLogin();
  } 
  
  else {
    alert("Usuário ou senha inválidos");
  }
};

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        width: 300
      }}>
        <h2 style={{ textAlign: "center" }}>Login 🔐</h2>

        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={input}
        />

        <button onClick={entrar} style={botao}>
          Entrar
        </button>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const botao = {
  width: "100%",
  padding: 10,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

export default Login;