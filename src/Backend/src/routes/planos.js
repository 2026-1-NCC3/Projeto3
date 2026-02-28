// src/routes/planos.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /planos — Lista todos com nome do paciente
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const planos = await db.sql`
      SELECT p.id_plano, p.data_inicio, p.data_final,
             p.frequencia, p.repeticoes, p.series,
             p.observacoes, u.nome AS paciente
      FROM Plano_Exercicios p
      LEFT JOIN Usuario u ON p.id_paciente = u.id_usuario
    `;
    res.json(planos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /planos/:id — Busca um plano com seus exercícios
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const plano = await db.sql`
      SELECT p.id_plano, p.data_inicio, p.data_final,
             p.frequencia, p.repeticoes, p.series,
             p.observacoes, u.nome AS paciente
      FROM Plano_Exercicios p
      LEFT JOIN Usuario u ON p.id_paciente = u.id_usuario
      WHERE p.id_plano = ${id}
    `;

    if (plano.length === 0) {
      return res.status(404).json({ erro: "Plano não encontrado" });
    }

    // Busca os exercícios do plano
    const exercicios = await db.sql`
      SELECT e.id_exercicio, e.titulo, e.descricao
      FROM Atividades_Prescritas ap
      JOIN Exercicio e ON ap.id_exercicio = e.id_exercicio
      WHERE ap.id_plano = ${id}
    `;

    res.json({ ...plano[0], exercicios });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /planos/paciente/:id_paciente — Planos de um paciente específico
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const planos = await db.sql`
      SELECT p.id_plano, p.data_inicio, p.data_final,
             p.frequencia, p.repeticoes, p.series, p.observacoes
      FROM Plano_Exercicios p
      WHERE p.id_paciente = ${id_paciente}
    `;

    res.json(planos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /planos — Cria novo plano
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const {
      data_inicio,
      data_final,
      frequencia,
      repeticoes,
      series,
      observacoes,
      id_admin,
      id_paciente,
    } = req.body;

    if (!data_inicio || !data_final || !id_paciente) {
      return res.status(400).json({
        erro: "data_inicio, data_final e id_paciente são obrigatórios",
      });
    }

    await db.sql`
      INSERT INTO Plano_Exercicios 
        (data_inicio, data_final, frequencia, repeticoes, series, observacoes, id_admin, id_paciente)
      VALUES 
        (${data_inicio}, ${data_final}, ${frequencia}, ${repeticoes}, ${series}, ${observacoes}, ${id_admin}, ${id_paciente})
    `;

    res.status(201).json({ mensagem: "Plano criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /planos/:id — Atualiza plano
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      data_inicio,
      data_final,
      frequencia,
      repeticoes,
      series,
      observacoes,
    } = req.body;

    await db.sql`
      UPDATE Plano_Exercicios
      SET data_inicio = ${data_inicio}, data_final = ${data_final},
          frequencia = ${frequencia}, repeticoes = ${repeticoes},
          series = ${series}, observacoes = ${observacoes}
      WHERE id_plano = ${id}
    `;

    res.json({ mensagem: "Plano atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /planos/:id — Deleta plano
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Atividades_Prescritas WHERE id_plano = ${id}`;
    await db.sql`DELETE FROM Plano_Exercicios WHERE id_plano = ${id}`;

    res.json({ mensagem: "Plano deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
