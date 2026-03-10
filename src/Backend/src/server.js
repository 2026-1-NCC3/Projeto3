// src/server.js
const express = require("express");
const { connectDatabase } = require("./database/db");

const usuariosRoutes = require("./routes/usuario.js");
const exerciciosRoutes = require("./routes/exercicios.js");
const planosRoutes = require("./routes/planos.js");
const execucoesRoutes = require("./routes/execucoes.js");
const notificacoesRoutes = require("./routes/notificacoes.js");
const postagensRoutes = require("./routes/postagens.js");
const pacientesRoutes = require("./routes/pacientes.js");
const { autenticar, apenasAdmin } = require("./middlewares/auth.js");
const authRoutes = require("./routes/auth.js");
const arquivosRoutes = require("./routes/arquivos.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "Servidor rodando! 🚀" });
});

// Rota para testar o banco
app.get("/health", async (req, res) => {
  try {
    const { getDb } = require("./database/db");
    const db = getDb();
    await db.sql`SELECT 1`;
    res.json({
      status: "ok",
      database: "conectado ✅",
    });
  } catch (error) {
    res.status(500).json({
      status: "erro",
      database: "desconectado ❌",
      message: error.message,
    });
  }
});

// Inicia o servidor SÓ após conectar ao banco
async function startServer() {
  await connectDatabase();

  // Rota pública
  app.use("/auth", authRoutes);

  // Rotas protegidas — qualquer usuário logado
  app.use("/execucoes", autenticar, execucoesRoutes);
  app.use("/notificacoes", autenticar, notificacoesRoutes);
  app.use("/planos", autenticar, planosRoutes);
  app.use("/postagens", autenticar, postagensRoutes);

  // Rotas só para admin
  app.use("/pacientes", autenticar, apenasAdmin, pacientesRoutes);
  app.use("/exercicios", autenticar, apenasAdmin, exerciciosRoutes);
  app.use("/usuarios", autenticar, apenasAdmin, usuariosRoutes);
  app.use("/uploads", express.static("src/uploads"));
  app.use("/arquivos", autenticar, apenasAdmin, arquivosRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
