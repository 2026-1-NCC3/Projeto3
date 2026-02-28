// src/routes/execucoes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /execucoes — Lista todas
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const execucoes = await db.sql`
      SELECT r.id_execucao, r.data_execucao, r.dor_nivel,
             r.observacoes, r.concluido, u.nome AS paciente
      FROM Registro_Execucao r
      LEFT JOIN Usuario u ON r.id_paciente = u.id_usuario
      ORDER BY r.data_execucao DESC
    `;
    res.json(execucoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /execucoes/paciente/:id_paciente — Histórico de um paciente
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const execucoes = await db.sql`
      SELECT id_execucao, data_execucao, dor_nivel,
             observacoes, concluido
      FROM Registro_Execucao
      WHERE id_paciente = ${id_paciente}
      ORDER BY data_execucao DESC
    `;

    if (execucoes.length === 0) {
      return res
        .status(404)
        .json({ erro: "Nenhum registro encontrado para este paciente" });
    }

    res.json(execucoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /execucoes/:id — Busca uma execução por ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const execucao = await db.sql`
      SELECT r.id_execucao, r.data_execucao, r.dor_nivel,
             r.observacoes, r.concluido, u.nome AS paciente
      FROM Registro_Execucao r
      LEFT JOIN Usuario u ON r.id_paciente = u.id_usuario
      WHERE r.id_execucao = ${id}
    `;

    if (execucao.length === 0) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json(execucao[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /execucoes — Paciente registra execução (check-in)
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { dor_nivel, observacoes, concluido, id_paciente } = req.body;

    if (!id_paciente || concluido === undefined) {
      return res.status(400).json({
        erro: "id_paciente e concluido são obrigatórios",
      });
    }

    await db.sql`
      INSERT INTO Registro_Execucao (dor_nivel, observacoes, concluido, id_paciente)
      VALUES (${dor_nivel}, ${observacoes}, ${concluido}, ${id_paciente})
    `;

    res.status(201).json({ mensagem: "Execução registrada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /execucoes/:id — Atualiza registro
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { dor_nivel, observacoes, concluido } = req.body;

    await db.sql`
      UPDATE Registro_Execucao
      SET dor_nivel = ${dor_nivel},
          observacoes = ${observacoes},
          concluido = ${concluido}
      WHERE id_execucao = ${id}
    `;

    res.json({ mensagem: "Registro atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /execucoes/:id — Deleta registro
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Registro_Execucao WHERE id_execucao = ${id}`;

    res.json({ mensagem: "Registro deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
