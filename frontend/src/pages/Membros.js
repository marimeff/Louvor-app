import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function Membros() {
  const [form, setForm] = useState({
    nome: "",
    funcao: "",
    aniversario: "",
    ativo: "1"
  });

  const [membros, setMembros] = useState([]);

  const carregarMembros = () => {
    fetch("http://localhost:3000/membros")
      .then(res => res.json())
      .then(data => setMembros(data));
  };

  useEffect(() => {
    carregarMembros();
  }, []);

const atualizarStatus = async (id, ativo) => {
  const ativoBoolean = ativo === "1";

  // UI instantânea
  setMembros(prev =>
    prev.map(m =>
      m.id === id ? { ...m, ativo: ativoBoolean ? 1 : 0 } : m
    )
  );

  await fetch(`http://localhost:3000/membros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ativo: ativoBoolean
    })
  });
};

const atualizarRecorrencia = async (id, recorrencia) => {
  // ✅ 1. Atualiza na tela imediatamente
  setMembros(prev =>
    prev.map(m =>
      m.id === id ? { ...m, recorrencia } : m
    )
  );

  // ✅ 2. Depois salva no backend
  await fetch(`http://localhost:3000/membros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recorrencia
    })
  });
};

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const adicionarMembro = async () => {
    if (!form.nome) return alert("Digite o nome");

    await fetch("http://localhost:3000/membros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        ativo: form.ativo === "1"
      })
    });

    setForm({
      nome: "",
      funcao: "",
      aniversario: "",
      ativo: "1"
    });

    carregarMembros();
  };

  return (
    <Layout>
    <div style={{ padding: 20 }}>
      <h1>👤 Membros</h1>

      {/* CARD FORM */}
      <div style={card}>
        <h3>Cadastrar membro</h3>

        <div style={grid}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} style={input} />
          <input name="funcao" placeholder="Função (Vocal, Guitarra...)" value={form.funcao} onChange={handleChange} style={input} />
          <input type="date" name="aniversario" value={form.aniversario} onChange={handleChange} style={input} />

          <select name="ativo" value={form.ativo} onChange={handleChange} style={input}>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>

        <button onClick={adicionarMembro} style={botao}>
          + Adicionar
        </button>
      </div>

      {/* LISTA */}
      <div style={card}>
  <h3>Lista de membros</h3>

  <table style={tabela}>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Função</th>
        <th>Aniversario</th>
        <th>Status</th>
        <th>Indisponibilidade Recorrente</th>
      </tr>
    </thead>

    <tbody>
      {membros.map((m) => (
        <tr key={m.id}>
          <td>{m.nome}</td>
          <td>{m.funcao}</td>
          <td>{m.aniversario || "-"}</td>

          <td>
            <select
              value={String(m.ativo)}
              onChange={(e) => atualizarStatus(m.id, e.target.value)}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </td>

          <td>
            <select
              value={m.recorrencia || ""}
              onChange={(e) => atualizarRecorrencia(m.id, e.target.value)}
            >
              <option value="">Sempre disponível</option>
              <option value="0">Não pode Domingo</option>
              <option value="2">Não pode Terça</option>
              <option value="0,2">Não pode Domingo + Terça</option>
            </select>
          </td>
                    
        </tr>
      ))}
    </tbody>
  </table>
      </div>
          </div>
    </Layout>
  );
}

// 🎨 estilos
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 15
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const botao = {
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer"
};

const item = {
  padding: 10,
  borderBottom: "1px solid #eee"
};

const tabela = {
  width: "100%",
  borderCollapse: "collapse"
};

const thtd = {
  padding: 10,
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};



export default Membros;