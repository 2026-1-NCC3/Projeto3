// src/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getDb } = require("../database/db");
const { hashSenha, verificarSenha } = require("../utils/hash");

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const db = getDb();
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha são obrigatórios" });
    }

    // Busca o usuário
    const usuarios = await db.sql`
      SELECT id_usuario, nome, email, senha FROM Usuario
      WHERE email = ${email}
    `;

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const usuario = usuarios[0];

    // Verifica a senha — suporta bcrypt E texto puro (legado)
    let senhaValida = false;

    if (usuario.senha.startsWith("$2")) {
      // Senha criptografada com bcrypt
      senhaValida = await verificarSenha(senha, usuario.senha);
    } else {
      // Senha legada em texto puro
      senhaValida = senha === usuario.senha;
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    // Verifica se é admin ou paciente
    const isAdmin = await db.sql`
      SELECT id_usuario FROM Usuario_ADM 
      WHERE id_usuario = ${usuario.id_usuario}
    `;

    const perfil = isAdmin.length > 0 ? "admin" : "paciente";

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        nome: usuario.nome,
        perfil,
      },
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
        perfil,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /auth/registro — Cadastro de novo paciente
router.post("/registro", async (req, res) => {
  try {
    const db = getDb();
    const { nome, email, senha, telefone, data_nascimento, observacoes } =
      req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "nome, email e senha são obrigatórios",
      });
    }

    // Verifica se email já existe
    const emailExiste = await db.sql`
      SELECT id_usuario FROM Usuario WHERE email = ${email}
    `;

    if (emailExiste.length > 0) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    // Criptografa a senha
    const senhaCriptografada = await hashSenha(senha);

    // Insere na tabela Usuario
    await db.sql`
      INSERT INTO Usuario (nome, email, senha)
      VALUES (${nome}, ${email}, ${senhaCriptografada})
    `;

    const resultado = await db.sql`
      SELECT id_usuario FROM Usuario WHERE email = ${email}
    `;
    const id_novo = resultado[0].id_usuario;

    // Insere na tabela Usuario_Paciente
    await db.sql`
      INSERT INTO Usuario_Paciente 
        (id_usuario, telefone, data_nascimento, observacoes, status_tratamento)
      VALUES 
        (${id_novo}, ${telefone}, ${data_nascimento}, ${observacoes}, 'Ativo')
    `;

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      id_usuario: id_novo,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /auth/me — Retorna dados do usuário logado
router.get(
  "/me",
  require("../middlewares/auth").autenticar,
  async (req, res) => {
    try {
      const db = getDb();

      const usuario = await db.sql`
      SELECT id_usuario, nome, email, data_cadastro
      FROM Usuario
      WHERE id_usuario = ${req.usuario.id}
    `;

      res.json({ ...usuario[0], perfil: req.usuario.perfil });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
);

module.exports = router;
