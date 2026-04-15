import { useEffect, useState } from "react";

function Historico() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("historicoEscalas") || "[]");
    setHistorico(dados.reverse()); // mais recente primeiro
  }, []);

  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const removerEscala = (index) => {
  const historico = JSON.parse(localStorage.getItem("historicoEscalas") || "[]");

  historico.splice(index, 1);

  localStorage.setItem("historicoEscalas", JSON.stringify(historico));

  window.location.reload();
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Histórico de Escalas</h2>

      {historico.length === 0 && (
        <p>Nenhuma escala enviada ainda.</p>
      )}



      {historico.map((item, index) => (
  <div key={index} style={card}>

    {/* 🔹 LINHA DE CIMA */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      
      <div>
        <h3 style={{ margin: 0 }}>
          Escala {String(item.mes).padStart(2, "0")}/{item.ano}
        </h3>

        <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>
          Enviado em: {formatarData(item.dataGeracao)}
        </p>
      </div>

      <button
        onClick={() => removerEscala(index)}
        style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Excluir
      </button>
    </div>

    {/* 🔹 TABELA EMBAIXO */}
    <table style={{ ...tabela, marginTop: 15 }}>
      <thead>
        <tr>
          <th>Data</th>
          <th>Dia</th>
          {Object.keys(item.escala[0] || {})
            .filter(k => k !== "data" && k !== "dia")
            .map((f) => (
              <th key={f}>{f}</th>
            ))}
        </tr>
      </thead>

      <tbody>
        {item.escala.map((linha, i) => (
          <tr key={i}>
            <td>{new Date(linha.data).toLocaleDateString("pt-BR")}</td>
            <td>{linha.dia}</td>

            {Object.keys(linha)
              .filter(k => k !== "data" && k !== "dia")
              .map((f) => (
                <td key={f}>{linha[f]}</td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>

  </div>
        ))}
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const tabela = {
  width: "100%",
  borderCollapse: "collapse"
};

export default Historico;