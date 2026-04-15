import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import html2canvas from "html2canvas";


function Escala() {
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [datas, setDatas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [indisponibilidade, setIndisponibilidade] = useState({});
  const funcoes = [
  "guitarra",
  "bateria",
  "baixo",
  "violão",
  "teclado",
  "ministro",
  "tenor",
  "contralto",
  "soprano",
  "som",
  "multimídia"
  ];
  const [escala, setEscala] = useState([]);
  useEffect(() => {
  const salva = localStorage.getItem("escalaCompleta");

  if (salva) {
    const dados = JSON.parse(salva);

    setMes(dados.mes || "");
    setAno(dados.ano || "");
    setDatas((dados.datas || []).map(d => new Date(d)));
    setMembros(dados.membros || []);
    setIndisponibilidade(dados.indisponibilidade || {});
    setEscala(dados.escala || []);
  }
}, []);



  const formatarDataBR = (data) => {
  return new Date(data).toLocaleDateString("pt-BR");
  };
  const getDiaSemana = (data) => {
    const dia = new Date(data).getDay();

    if (dia === 0) return "Dom";
    if (dia === 2) return "Ter";

    return "";
  };






  // 🚀 GERAR MATRIZ+
  const gerarMatriz = async () => {
  if (!mes || !ano) {
    alert("Selecione mês e ano");
    return;
  }

  // 1️⃣ GERAR DATAS LOCALMENTE
  const datasGeradas = [];
  const data = new Date(ano, mes - 1, 1);

  while (data.getMonth() === mes - 1) {
    const diaSemana = data.getDay();

    if (diaSemana === 0 || diaSemana === 2) {
      datasGeradas.push(new Date(data));
    }

    data.setDate(data.getDate() + 1);
  }

  // 2️⃣ BUSCAR MEMBROS
  const res = await fetch("http://localhost:3000/membros");
  const dataMembros = await res.json();
  const membrosAtivos = dataMembros.filter((m) => m.ativo);

  // 3️⃣ CRIAR MATRIZ DE INDISPONIBILIDADE
  const novaMatriz = {};

  datasGeradas.forEach((d) => {
    const dataStr = d.toISOString().split("T")[0];

    membrosAtivos.forEach((m) => {
      const key = `${m.id}-${dataStr}`;

      // já marca recorrência automaticamente
      if (isIndisponivel(m, d)) {
        novaMatriz[key] = true;
      }
    });
  });

  // 4️⃣ ATUALIZA STATES
  setDatas(datasGeradas);
  setMembros(membrosAtivos);
  setIndisponibilidade(novaMatriz);
};

  // 🧠 VERIFICAR INDISPONIBILIDADE (RECORRÊNCIA)
  const isIndisponivel = (membro, data) => {
  const dia = new Date(data).getDay();

  if (!membro.recorrencia || membro.recorrencia === "") {
    return false;
  }

  return membro.recorrencia
    .split(",")
    .map((d) => d.trim()) // 🔥 evita erro tipo "0, 2"
    .includes(String(dia));
};

const toggleIndisponibilidade = (membroId, data) => {
  const dataStr = new Date(data).toISOString().split("T")[0];
  const key = `${membroId}-${dataStr}`;

  const membro = membros.find(m => m.id === membroId);

  setIndisponibilidade((prev) => ({
    ...prev,
    [key]: !(prev[key] ?? isIndisponivel(membro, data))
  }));
};

const atualizarEscala = (indexLinha, funcao, novoNome) => {
  setEscala((prev) => {
    const nova = [...prev];

    nova[indexLinha] = {
      ...nova[indexLinha],
      [funcao]: novoNome
    };

    return nova;
  });
};

const enviarWhatsApp = async () => {
  try {
    const elemento = document.getElementById("escala-print");

    // 🔥 GARANTE QUE ESTÁ VISÍVEL
    elemento.style.background = "#ffffff";

    const canvas = await html2canvas(elemento, {
      scale: 2, // melhora qualidade
      useCORS: true
    });

    const imagem = canvas.toDataURL("image/png", 1.0);

    // 🔥 TESTE: abrir imagem em nova aba
    const novaAba = window.open();
    novaAba.document.write(`<img src="${imagem}" />`);

    // 💾 SALVAR HISTÓRICO
    const historico = JSON.parse(localStorage.getItem("historicoEscalas") || "[]");

    historico.push({
      dataGeracao: new Date().toISOString(),
      mes,
      ano,
      escala
    });

    localStorage.setItem("historicoEscalas", JSON.stringify(historico));

    // 🔥 DOWNLOAD
    const link = document.createElement("a");
    link.href = imagem;
    link.download = "escala.png";
    link.click();

    // 🔥 WHATSAPP (abre conversa)
    const numero = "5531984836143";
    const mensagem = encodeURIComponent("Escala do mês pronta 🎶");

    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");

  } catch (err) {
    console.log(err);
    alert("Erro ao gerar imagem 😢");
  }
};

const getTituloEscala = () => {
  const mesFormatado = String(mes).padStart(2, "0");
  return `Escala ${mesFormatado}/${ano}`;
};

//Gerar Escala
const gerarEscala = () => {
  const novaEscala = [];

  // contador pra evitar repetir sempre os mesmos
  const uso = {};

  membros.forEach(m => {
    uso[m.id] = 0;
  });

  datas.forEach((d) => {
    const dataStr = d.toISOString().split("T")[0];

    const linha = {
      data: dataStr,
      dia: getDiaSemana(d) // 🔥 ADICIONE ISSO
    };

    // pessoas disponíveis nesse dia
    const disponiveis = membros.filter((m) => {
      const key = `${m.id}-${dataStr}`;
      return !indisponibilidade[key] && !isIndisponivel(m, d);
    });

    // embaralhar pra não ficar sempre igual
    const embaralhados = [...disponiveis].sort(() => Math.random() - 0.5);

    funcoes.forEach((funcao) => {
      // pega quem menos foi usado
      const candidato = embaralhados
        .sort((a, b) => uso[a.id] - uso[b.id])
        .find((m) => m.funcao?.toLowerCase().includes(funcao));

      if (candidato) {
        linha[funcao] = candidato.nome;
        uso[candidato.id]++;
      } else {
        linha[funcao] = "—";
      }
    });

    novaEscala.push(linha);
  });

  setEscala(novaEscala);

  localStorage.setItem("escalaCompleta", JSON.stringify({
    mes,
    ano,
    datas,
    membros,
    indisponibilidade,
    escala: novaEscala
  }));
};
  return (
    
    <Layout>
    <div style={{ padding: 20 }}>
      <div> 
        <h2 style={{ margin: 0 }}>1- Defina mes e ano</h2>
        <p style={{ margin: 0, color: "#64748b" }}>
          Escolha o periodo para gerar a escala
        </p>

      </div>

      {/* FORM */}
      <div style={card}>
  <div style={formLinha}>
    <input
      type="number"
      placeholder="Mês"
      value={mes}
      onChange={(e) => setMes(e.target.value)}
      style={input}
    />

    <input
      type="number"
      placeholder="Ano"
      value={ano}
      onChange={(e) => setAno(e.target.value)}
      style={input}
    />

    
  </div>
</div>

<div style={{ marginTop: 15, display: "flex", justifyContent: "flex-end" }}>
  <button onClick={gerarMatriz} style={botaoPrimario}>
    Gerar Matriz →
  </button>
</div>

      {/* MATRIZ */}
      {datas.length > 0 && (
        <>
          {/* 🔹 BLOCO DE TÍTULO (IGUAL PASSO 1) */}
          <div style={{ marginTop: 30 }}>
            <h2 style={{ margin: 0 }}>
              2 - Indisponibilidades
            </h2>

            <p style={{ margin: 0, color: "#64748b" }}>
              Selecione os dias em que cada pessoa NÃO pode participar
            </p>
          </div>

          {/* 🔹 CARD COM A TABELA */}
          <div style={{ ...card, marginTop: 10 }}>
            <table style={tabela}>
              <thead>
                <tr>
                  <th style={th}>Pessoa</th>

                  {datas.map((d, i) => (
                    <th key={i}>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {getDiaSemana(d)}
                      </div>
                      <div>
                        {formatarDataBR(d)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {membros.map((m) => (
                  <tr key={m.id} style={linhaTabela}>
                    <td style={td}>{m.nome}</td>

                    {datas.map((d, i) => {
                      const dataStr = d.toISOString().split("T")[0];
                      const key = `${m.id}-${dataStr}`;

                      return (
                        <td key={i}>
                          <input
                            type="checkbox"
                            style={{
                              transform: "scale(1.3)",
                              cursor: "pointer",
                              accentColor: "#6366f1"
                            }}
                            checked={
                              indisponibilidade[key] ||
                              isIndisponivel(m, d)
                            }
                            onChange={() =>
                              toggleIndisponibilidade(m.id, d)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 BOTÃO */}
          <div
            style={{
              marginTop: 15,
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <button onClick={gerarEscala} style={botaoSecundario}>
              Gerar Escala →
            </button>
          </div>
        </>
      )}

      {escala.length > 0 && (
  <>
  <div id="escala-print" >
    {/* 🔹 TÍTULO (IGUAL PASSO 1 E 2) */}
    <div style={{ marginTop: 30 }}>
      <h2 style={{ margin: 0 }}>
        {getTituloEscala()}
      </h2>

      <p style={{ margin: 0, color: "#64748b" }}>
        Revise e ajuste a escala antes de finalizar
      </p>
    </div>

    {/* 🔹 CARD */}
    <div style={{ ...card, marginTop: 10 }}>
      <table style={tabela}>
        <thead>
          <tr>
            <th style={th}>Data</th>
            <th style={th}>Dia</th>

            {funcoes.map((f) => (
              <th key={f}>{f}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {escala.map((linha, i) => (
            <tr key={i} style={linhaTabela}>
              <td style={td}>
                {formatarDataBR(linha.data)}
              </td>

              <td style={td}>{linha.dia}</td>

              {funcoes.map((f) => (
                <td key={f}>
                  <select
                    value={linha[f] || ""}
                    onChange={(e) =>
                      atualizarEscala(i, f, e.target.value)
                    }
                    style={select}
                  >
                    <option value="">—</option>

                    {membros
                      .filter((m) =>
                        m.funcao?.toLowerCase().includes(f.toLowerCase())
                      )
                      .map((m) => (
                        <option key={m.id} value={m.nome}>
                          {m.nome}
                        </option>
                      ))}
                  </select>
                </td>
                
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
  <button onClick={enviarWhatsApp} style={botaoPrimario}>
    Enviar no WhatsApp 📲
      </button>
    </div>
  </>
)}
      

      
    </div>
    
      
  </Layout>
  );
}

// 🎨 ESTILOS
const card = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 16,
  marginBottom: 20,
  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  border: "1px solid #f1f1f1"
};

const header = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 16,
  marginBottom: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
};

const linhaTabela = {
  background: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  borderRadius: 10
};

const formLinha = {
  display: "flex",
  gap: 12,
  alignItems: "center"
};

const botaoPrimario = {
  padding: "10px 18px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const select = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  width: "100%",
  background: "#f8fafc",
  fontSize: 13
};

const input = {
  padding: 10,
  marginRight: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const botao = {
  padding: "10px 18px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 4px 10px rgba(34,197,94,0.3)"
};

const tabela = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 10px"
};

const th = {
  padding: 12,
  fontSize: 12,
  color: "#94a3b8",
  fontWeight: "600",
  textAlign: "center"
};

const td = {
  padding: 12,
  fontSize: 14,
  textAlign: "center"
};

const botaoSecundario = {
  padding: "12px 20px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 4px 10px rgba(34,197,94,0.3)"
};

const subtitulo = {
  color: "#64748b",
  marginBottom: 10
};

const tituloSecao = {
  marginTop: 30,
  marginBottom: 5,
  fontWeight: "600"
};

export default Escala;