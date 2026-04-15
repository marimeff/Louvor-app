import { useState } from "react";
import Membros from "./pages/Membros";
import Indisponibilidade from "./pages/Indisponibilidade";
import Escalas from "./pages/Escalas";
import Historico from "./pages/Historico";
import Login from "./pages/Login";

function App() {
  const [pagina, setPagina] = useState("membros");
  const usuario = localStorage.getItem("usuario");
  const [logado, setLogado] = useState(
  localStorage.getItem("logado") === "true"
);

  const renderPagina = () => {
    switch (pagina) {
      case "membros":
        return <Membros />;
      case "indisponibilidade":
        return <Indisponibilidade />;
      case "escalas":
        return <Escalas />;
      default:
        return <Membros />;
      case "historico":
         return <Historico />;
    }
  };

  if (!logado) {
  return <Login onLogin={() => setLogado(true)}/>;
}

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{
        width: 250,
        background: "#000",
        color: "white",
        padding: 20
      }}>
        {/* LOGO */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 30
        }}>
          <img 
            src="/logo.png" 
            alt="Logo Igreja" 
            style={{
              width: 120,
              objectFit: "contain"
            }}
          /> 
          <h3 style={{
            margin: 0,
            fontSize: 15,
            fontWeight: "500",
            color: "#e5e5e5",
            textAlign: "center"
          }}>
            Igreja Batista Elim
          </h3>
        </div>

        <h3 onClick={() => setPagina("membros")} style={{ cursor: "pointer", textAlign: "center" }}>
          Membros
        </h3>

        <h3 onClick={() => setPagina("escalas")} style={{ cursor: "pointer", textAlign: "center" }}>
          Escalas
        </h3>

        <h3 onClick={() => setPagina("historico")} style={{ cursor: "pointer", textAlign: "center" }}>
          Histórico
        </h3>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: 20 }}>
        {renderPagina()}
      </div>

    </div>
  );
}

export default App;