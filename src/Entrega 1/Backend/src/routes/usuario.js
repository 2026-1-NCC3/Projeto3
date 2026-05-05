// src/routes/usuarios.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");
const { hashSenha } = require("../utils/hash");

// GET /usuarios — Lista todos
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const usuarios = await db.sql`
      SELECT id_usuario, nome, email, data_cadastro 
      FROM Usuario
    `;
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /usuarios/:id — Busca um por ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const usuario = await db.sql`
      SELECT id_usuario, nome, email, data_cadastro 
      FROM Usuario 
      WHERE id_usuario = ${id}
    `;
    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.json(usuario[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /usuarios — Cria novo (sempre com senha criptografada)
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "nome, email e senha são obrigatórios" });
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

    await db.sql`
      INSERT INTO Usuario (nome, email, senha) 
      VALUES (${nome}, ${email}, ${senhaCriptografada})
    `;

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /usuarios/:id — Atualiza
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    // Se vier nova senha, criptografa — senão mantém a atual
    let senhaFinal;
    if (senha) {
      senhaFinal = await hashSenha(senha);
    } else {
      const atual = await db.sql`
        SELECT senha FROM Usuario WHERE id_usuario = ${id}
      `;
      senhaFinal = atual[0].senha;
    }

    await db.sql`
      UPDATE Usuario 
      SET nome = ${nome}, email = ${email}, senha = ${senhaFinal}
      WHERE id_usuario = ${id}
    `;

    res.json({ mensagem: "Usuário atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /usuarios/:id — Deleta
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Usuario WHERE id_usuario = ${id}`;

    res.json({ mensagem: "Usuário deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
