// src/routes/sessoes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /sessoes/paciente/:id_paciente
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const sessoes = await db.sql`
      SELECT s.id_sessao, s.data_sessao, s.anotacoes,
             u.nome AS admin
      FROM Sessao s
      LEFT JOIN Usuario u ON s.id_admin = u.id_usuario
      WHERE s.id_paciente = ${id_paciente}
      ORDER BY s.data_sessao DESC
    `;

    res.json(sessoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /sessoes/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const sessao = await db.sql`
      SELECT s.id_sessao, s.data_sessao, s.anotacoes,
             u.nome AS paciente
      FROM Sessao s
      LEFT JOIN Usuario u ON s.id_paciente = u.id_usuario
      WHERE s.id_sessao = ${id}
    `;

    if (sessao.length === 0) {
      return res.status(404).json({ erro: "Sessão não encontrada" });
    }

    res.json(sessao[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /sessoes
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { anotacoes, id_paciente, id_admin } = req.body;

    if (!id_paciente || !id_admin) {
      return res
        .status(400)
        .json({ erro: "id_paciente e id_admin são obrigatórios" });
    }

    await db.sql`
      INSERT INTO Sessao (anotacoes, id_paciente, id_admin)
      VALUES (${anotacoes}, ${id_paciente}, ${id_admin})
    `;

    res.status(201).json({ mensagem: "Sessão registrada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /sessoes/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { anotacoes } = req.body;

    await db.sql`
      UPDATE Sessao SET anotacoes = ${anotacoes}
      WHERE id_sessao = ${id}
    `;

    res.json({ mensagem: "Sessão atualizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /sessoes/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Sessao WHERE id_sessao = ${id}`;

    res.json({ mensagem: "Sessão deletada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
