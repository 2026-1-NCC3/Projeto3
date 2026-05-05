// src/routes/postagens.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /postagens — Lista todas
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const postagens = await db.sql`
      SELECT p.id_postagem, p.conteudo, p.data_envio, 
             p.status, u.nome AS autor
      FROM Postagem p
      LEFT JOIN Usuario u ON p.id_admin = u.id_usuario
      ORDER BY p.data_envio DESC
    `;
    res.json(postagens);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /postagens/ativas — Só as ativas (para o app mobile)
router.get("/ativas", async (req, res) => {
  try {
    const db = getDb();
    const postagens = await db.sql`
      SELECT p.id_postagem, p.conteudo, p.data_envio, u.nome AS autor
      FROM Postagem p
      LEFT JOIN Usuario u ON p.id_admin = u.id_usuario
      WHERE p.status = 'ativo'
      ORDER BY p.data_envio DESC
    `;
    res.json(postagens);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /postagens/:id — Busca uma por ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const postagem = await db.sql`
      SELECT p.id_postagem, p.conteudo, p.data_envio,
             p.status, u.nome AS autor
      FROM Postagem p
      LEFT JOIN Usuario u ON p.id_admin = u.id_usuario
      WHERE p.id_postagem = ${id}
    `;

    if (postagem.length === 0) {
      return res.status(404).json({ erro: "Postagem não encontrada" });
    }

    res.json(postagem[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /postagens — Cria nova postagem
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { conteudo, id_admin } = req.body;

    if (!conteudo || !id_admin) {
      return res.status(400).json({
        erro: "conteudo e id_admin são obrigatórios",
      });
    }

    await db.sql`
      INSERT INTO Postagem (conteudo, status, id_admin)
      VALUES (${conteudo}, 'ativo', ${id_admin})
    `;

    res.status(201).json({ mensagem: "Postagem criada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /postagens/:id — Atualiza postagem
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { conteudo, status } = req.body;

    await db.sql`
      UPDATE Postagem
      SET conteudo = ${conteudo}, status = ${status}
      WHERE id_postagem = ${id}
    `;

    res.json({ mensagem: "Postagem atualizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /postagens/:id — Deleta postagem
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Notificacao WHERE id_postagem = ${id}`;
    await db.sql`DELETE FROM Postagem WHERE id_postagem = ${id}`;

    res.json({ mensagem: "Postagem deletada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
