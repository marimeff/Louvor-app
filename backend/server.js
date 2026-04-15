const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PDFDocument = require("pdfkit");
const fs = require("fs");


app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

//Whatsapp

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

client = new Client({
  authStrategy: new LocalAuth()
});

// QR CODE
client.on('qr', (qr) => {
  console.log('📱 Escaneie o QR Code abaixo:');
  qrcode.generate(qr, { small: true });
});

// Quando conectar
client.on('ready', () => {
  console.log('✅ WhatsApp PRONTO!');
});

// Iniciar
client.initialize();


// 🔥 TESTE API
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

//Gerar escala PDF
function gerarPDF(escala) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const filePath = "escala.pdf";

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text("Escala de Louvor", { align: "center" });

    doc.moveDown();

    escala.forEach((linha) => {
      doc
        .fontSize(12)
        .text(`${linha.data} (${linha.dia})`);

      Object.keys(linha).forEach((key) => {
        if (key !== "data" && key !== "dia") {
          doc.text(`  ${key}: ${linha[key]}`);
        }
      });

      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
  });
}

//Rota para gerar pdf
app.post("/gerar-pdf", async (req, res) => {
  const { escala } = req.body;

  const filePath = await gerarPDF(escala);

  res.json({ filePath });
});

// ENVIO WHATSAPP 
app.post('/enviar-whatsapp', async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        erro: true,
        msg: "WhatsApp não iniciado"
      });
    }

    console.log("📤 Enviando mensagem...");

    await client.sendMessage(
      "5531984836143@c.us",
      "escala do mês pronta"
    );

    res.json({ ok: true });

  } catch (err) {
    console.log("❌ ERRO REAL:", err);

    res.status(500).json({
      erro: true,
      msg: err.message
    });
  }
});

// 🧱 CRIAR TABELAS
db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS membros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    funcao TEXT,
    aniversario TEXT,
    ativo INTEGER,
    recorrencia TEXT
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS indisponibilidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      membro_id INTEGER,
      data TEXT
    )
  `);
});

// 🔍 TESTE
app.get('/', (req, res) => {
  res.send("API rodando 🚀");
});

// 👤 LISTAR MEMBROS
app.get('/membros', (req, res) => {
  db.all("SELECT * FROM membros", [], (err, rows) => {
    if (err) return res.status(500).json(err);

    console.log("📦 DADOS DO BANCO:", rows); // 👈 AQUI

    res.json(rows);
  });
});

// ➕ CRIAR MEMBRO
app.post('/membros', (req, res) => {
  console.log("BODY RECEBIDO:", req.body);

  const { nome, funcao, aniversario, ativo } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  db.run(
    "INSERT INTO membros (nome, funcao, aniversario, ativo) VALUES (?, ?, ?, ?)",
    [nome, funcao, aniversario, ativo ? 1 : 0],
    function (err) {
      if (err) {
        console.log("ERRO:", err);
        return res.status(500).json(err);
      }

      res.json({ id: this.lastID });
    }
  );
});

// ❌ INDISPONIBILIDADE
app.get('/indisponibilidade', (req, res) => {
  db.all("SELECT * FROM indisponibilidade", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post('/indisponibilidade', (req, res) => {
  const { membro_id, data } = req.body;

  db.run(
    "INSERT INTO indisponibilidade (membro_id, data) VALUES (?, ?)",
    [membro_id, data],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

app.delete('/indisponibilidade', (req, res) => {
  const { membro_id, data } = req.body;

  db.run(
    "DELETE FROM indisponibilidade WHERE membro_id = ? AND data = ?",
    [membro_id, data],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ATUALIZAR STATUS DO MEMBRO
app.put('/membros/:id', (req, res) => {
  const { ativo, recorrencia } = req.body;
  const { id } = req.params;

  console.log("📩 BODY RECEBIDO:", req.body);

  // 🔥 VALIDA SE VEIO ALGO
  if (ativo === undefined && recorrencia === undefined) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  // 🔥 CASO 1: atualizar só ativo
  if (ativo !== undefined && recorrencia === undefined) {
    db.run(
      "UPDATE membros SET ativo = ? WHERE id = ?",
      [ativo ? 1 : 0, id],
      function (err) {
        if (err) return res.status(500).json(err);

        db.get("SELECT * FROM membros WHERE id = ?", [id], (err, row) => {
          if (err) return res.status(500).json(err);
          res.json(row);
        });
      }
    );
    return;
  }

  // 🔥 CASO 2: atualizar só recorrencia
  if (recorrencia !== undefined && ativo === undefined) {

  const valor = String(recorrencia ?? "");

  db.run(
    "UPDATE membros SET recorrencia = ? WHERE id = ?",
    [valor, id],
    function (err) {
      if (err) {
        console.log("❌ ERRO SQLITE:", err); // 👈 mostra erro real
        return res.status(500).json(err);
      }

      db.get("SELECT * FROM membros WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json(err);

        console.log("✅ SALVO:", row); // 👈 confirmação

        res.json(row);
      });
    }
  );

  return;
}

  // 🔥 CASO 3: atualizar os dois
  const valor =
    recorrencia === "" ? null : String(recorrencia).trim();

  db.run(
    "UPDATE membros SET ativo = ?, recorrencia = ? WHERE id = ?",
    [ativo ? 1 : 0, valor, id],
    function (err) {
      if (err) return res.status(500).json(err);

      db.get("SELECT * FROM membros WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json(err);
        res.json(row);
      });
    }
  );
});

// INICIAR SERVIDOR
app.listen(3000, () => {
  console.log("Backend rodando em http://localhost:3000");
});

