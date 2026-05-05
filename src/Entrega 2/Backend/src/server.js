const express = require("express");
const { connectDatabase } = require("./database/db");
const { autenticar, apenasAdmin } = require("./middlewares/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://alinha-mais.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

// Importa rotas
const { router: authRoutes } = require("./routes/auth.js");
const usuariosRoutes = require("./routes/usuario.js");
const pacientesRoutes = require("./routes/pacientes.js");
const lembretesRoutes = require("./routes/lembretes.js");
const execucoesRoutes = require("./routes/execucoes.js");
const notificacoesRoutes = require("./routes/notificacoes.js");
const postagensRoutes = require("./routes/postagens.js");
const arquivosRoutes = require("./routes/arquivos.js");
const sessoesRoutes = require("./routes/sessoes.js");
const consultasRoutes = require("./routes/consultas.js");

// Rotas públicas
app.use("/auth", authRoutes);

// Rotas autenticadas
app.use("/execucoes", autenticar, execucoesRoutes);
app.use("/notificacoes", autenticar, notificacoesRoutes);
app.use("/postagens", autenticar, postagensRoutes);
app.use("/consultas", autenticar, consultasRoutes);
app.use("/lembretes", autenticar, lembretesRoutes);

// Rotas apenas admin
app.use("/usuarios", autenticar, apenasAdmin, usuariosRoutes);
app.use("/pacientes", autenticar, apenasAdmin, pacientesRoutes);
app.use("/arquivos", autenticar, apenasAdmin, arquivosRoutes);
app.use("/sessoes", autenticar, apenasAdmin, sessoesRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "online", mensagem: "API Maya RPG funcionando!" });
});

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
