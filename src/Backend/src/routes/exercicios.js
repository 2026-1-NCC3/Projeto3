// src/routes/exercicios.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /exercicios — Lista todos
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const exercicios = await db.sql`
      SELECT e.id_exercicio, e.titulo, e.descricao, 
             a.nome_arquivo, a.tipo_arquivo
      FROM Exercicio e
      LEFT JOIN Arquivo a ON e.id_arquivo = a.id_arquivo
    `;
    res.json(exercicios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /exercicios/:id — Busca um por ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const exercicio = await db.sql`
      SELECT e.id_exercicio, e.titulo, e.descricao,
             a.nome_arquivo, a.tipo_arquivo
      FROM Exercicio e
      LEFT JOIN Arquivo a ON e.id_arquivo = a.id_arquivo
      WHERE e.id_exercicio = ${id}
    `;
    if (exercicio.length === 0) {
      return res.status(404).json({ erro: "Exercício não encontrado" });
    }
    res.json(exercicio[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /exercicios — Cria novo
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { titulo, descricao, id_arquivo, id_admin } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: "titulo é obrigatório" });
    }

    await db.sql`
      INSERT INTO Exercicio (titulo, descricao, id_arquivo, id_admin)
      VALUES (${titulo}, ${descricao}, ${id_arquivo}, ${id_admin})
    `;

    res.status(201).json({ mensagem: "Exercício criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /exercicios/:id — Atualiza
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { titulo, descricao, id_arquivo } = req.body;

    await db.sql`
      UPDATE Exercicio
      SET titulo = ${titulo}, descricao = ${descricao}, id_arquivo = ${id_arquivo}
      WHERE id_exercicio = ${id}
    `;

    res.json({ mensagem: "Exercício atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /exercicios/:id — Deleta
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Exercicio WHERE id_exercicio = ${id}`;

    res.json({ mensagem: "Exercício deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
