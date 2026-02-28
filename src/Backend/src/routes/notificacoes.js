// src/routes/notificacoes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /notificacoes — Lista todas
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const notificacoes = await db.sql`
      SELECT n.id_notificacao, n.titulo, n.mensagem,
             n.data_envio, n.status, u.nome AS paciente
      FROM Notificacao n
      LEFT JOIN Usuario u ON n.id_paciente = u.id_usuario
      ORDER BY n.data_envio DESC
    `;
    res.json(notificacoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /notificacoes/paciente/:id_paciente — Notificações de um paciente
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const notificacoes = await db.sql`
      SELECT id_notificacao, titulo, mensagem, data_envio, status
      FROM Notificacao
      WHERE id_paciente = ${id_paciente}
      ORDER BY data_envio DESC
    `;

    res.json(notificacoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /notificacoes/paciente/:id_paciente/nao-lidas — Só as não lidas
router.get("/paciente/:id_paciente/nao-lidas", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const notificacoes = await db.sql`
      SELECT id_notificacao, titulo, mensagem, data_envio
      FROM Notificacao
      WHERE id_paciente = ${id_paciente} AND status = 'nao_lida'
      ORDER BY data_envio DESC
    `;

    res.json({ total_nao_lidas: notificacoes.length, notificacoes });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /notificacoes — Cria nova notificação
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { titulo, mensagem, id_paciente, id_postagem } = req.body;

    if (!titulo || !mensagem || !id_paciente) {
      return res.status(400).json({
        erro: "titulo, mensagem e id_paciente são obrigatórios",
      });
    }

    await db.sql`
      INSERT INTO Notificacao (titulo, mensagem, status, id_paciente, id_postagem)
      VALUES (${titulo}, ${mensagem}, 'nao_lida', ${id_paciente}, ${id_postagem})
    `;

    res.status(201).json({ mensagem: "Notificação criada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /notificacoes/:id/lida — Marca como lida
router.put("/:id/lida", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`
      UPDATE Notificacao
      SET status = 'lida'
      WHERE id_notificacao = ${id}
    `;

    res.json({ mensagem: "Notificação marcada como lida!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /notificacoes/:id — Deleta notificação
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Notificacao WHERE id_notificacao = ${id}`;

    res.json({ mensagem: "Notificação deletada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
