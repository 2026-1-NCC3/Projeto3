// src/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getDb } = require("../database/db");
const { hashSenha, verificarSenha } = require("../utils/hash");

// Gera id_login de 6 dígitos único
async function gerarIdLogin(db) {
  let idLogin;
  let existe = true;

  while (existe) {
    idLogin = String(Math.floor(100000 + Math.random() * 900000));
    const resultado = await db.sql`
      SELECT id_usuario FROM Usuario WHERE id_login = ${idLogin}
    `;
    existe = resultado.length > 0;
  }

  return idLogin;
}

// POST /auth/login — agora usa CPF + id_login
router.post("/login", async (req, res) => {
  try {
    const db = getDb();
    const { cpf, id_login } = req.body;

    if (!cpf || !id_login) {
      return res.status(400).json({ erro: "cpf e id_login são obrigatórios" });
    }

    // Busca paciente pelo CPF
    const usuarios = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.id_login
      FROM Usuario u
      INNER JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      WHERE p.cpf = ${cpf}
    `;

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: "CPF ou código inválidos" });
    }

    const usuario = usuarios[0];

    // Verifica id_login
    if (usuario.id_login !== id_login) {
      return res.status(401).json({ erro: "CPF ou código inválidos" });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario, nome: usuario.nome, perfil: "paciente" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: "paciente",
      },
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /auth/login-admin — login do admin com email + senha
router.post("/login-admin", async (req, res) => {
  try {
    const db = getDb();
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha são obrigatórios" });
    }

    const usuarios = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.senha
      FROM Usuario u
      INNER JOIN Usuario_ADM a ON u.id_usuario = a.id_usuario
      WHERE u.email = ${email}
    `;

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const usuario = usuarios[0];

    let senhaValida = false;
    if (usuario.senha.startsWith("$2")) {
      senhaValida = await verificarSenha(senha, usuario.senha);
    } else {
      senhaValida = senha === usuario.senha;
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, nome: usuario.nome, perfil: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /auth/me
router.get(
  "/me",
  require("../middlewares/auth").autenticar,
  async (req, res) => {
    try {
      const db = getDb();

      const usuario = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.id_login, u.data_cadastro,
             p.cpf, p.telefone, p.data_nascimento, 
             p.status_tratamento, p.consultas_pagas
      FROM Usuario u
      LEFT JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      WHERE u.id_usuario = ${req.usuario.id}
    `;

      res.json({ ...usuario[0], perfil: req.usuario.perfil });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
);

// PUT /auth/alterar-senha (apenas admin)
router.put(
  "/alterar-senha",
  require("../middlewares/auth").autenticar,
  async (req, res) => {
    try {
      const db = getDb();
      const { senha_atual, nova_senha } = req.body;
      const id_usuario = req.usuario.id;

      if (!senha_atual || !nova_senha) {
        return res
          .status(400)
          .json({ erro: "senha_atual e nova_senha são obrigatórios" });
      }

      const usuario = await db.sql`
      SELECT senha FROM Usuario WHERE id_usuario = ${id_usuario}
    `;

      if (usuario.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      let senhaValida = false;
      if (usuario[0].senha.startsWith("$2")) {
        senhaValida = await verificarSenha(senha_atual, usuario[0].senha);
      } else {
        senhaValida = senha_atual === usuario[0].senha;
      }

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha atual incorreta" });
      }

      const novaSenhaCriptografada = await hashSenha(nova_senha);
      await db.sql`
      UPDATE Usuario SET senha = ${novaSenhaCriptografada}
      WHERE id_usuario = ${id_usuario}
    `;

      res.json({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
);

module.exports = { router, gerarIdLogin };
