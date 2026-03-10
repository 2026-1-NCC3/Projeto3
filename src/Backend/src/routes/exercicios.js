// src/routes/exercicios.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /exercicios — Lista todos
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const exercicios = await db.sql`
      SELECT id_exercicio, titulo, descricao
      FROM Exercicio
    `;

    // Para cada exercício busca os arquivos vinculados
    const exerciciosComArquivos = await Promise.all(
      exercicios.map(async (exercicio) => {
        const arquivos = await db.sql`
          SELECT a.id_arquivo, a.tipo_arquivo, a.nome_arquivo
          FROM Exercicio_Arquivos ea
          JOIN Arquivo a ON ea.id_arquivo = a.id_arquivo
          WHERE ea.id_exercicio = ${exercicio.id_exercicio}
        `;
        return { ...exercicio, arquivos };
      }),
    );

    res.json(exerciciosComArquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /exercicios/:id — Busca um com todos os arquivos
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const exercicio = await db.sql`
      SELECT id_exercicio, titulo, descricao
      FROM Exercicio
      WHERE id_exercicio = ${id}
    `;

    if (exercicio.length === 0) {
      return res.status(404).json({ erro: "Exercício não encontrado" });
    }

    const arquivos = await db.sql`
      SELECT a.id_arquivo, a.tipo_arquivo, a.nome_arquivo
      FROM Exercicio_Arquivos ea
      JOIN Arquivo a ON ea.id_arquivo = a.id_arquivo
      WHERE ea.id_exercicio = ${id}
    `;

    res.json({ ...exercicio[0], arquivos });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /exercicios — Cria exercício e vincula vários arquivos
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { titulo, descricao, id_admin, arquivos } = req.body;
    // arquivos = [1, 2, 3]

    if (!titulo) {
      return res.status(400).json({ erro: "titulo é obrigatório" });
    }

    await db.sql`
      INSERT INTO Exercicio (titulo, descricao, id_admin)
      VALUES (${titulo}, ${descricao}, ${id_admin})
    `;

    const resultado = await db.sql`
      SELECT id_exercicio FROM Exercicio
      ORDER BY id_exercicio DESC LIMIT 1
    `;
    const id_exercicio = resultado[0].id_exercicio;

    // Vincula os arquivos se vieram no body
    if (arquivos && arquivos.length > 0) {
      for (const id_arquivo of arquivos) {
        await db.sql`
          INSERT INTO Exercicio_Arquivos (id_exercicio, id_arquivo)
          VALUES (${id_exercicio}, ${id_arquivo})
        `;
      }
    }

    res.status(201).json({
      mensagem: "Exercício criado com sucesso!",
      id_exercicio,
      arquivos_vinculados: arquivos ? arquivos.length : 0,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /exercicios/:id — Atualiza e substitui arquivos
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { titulo, descricao, arquivos } = req.body;

    await db.sql`
      UPDATE Exercicio
      SET titulo = ${titulo}, descricao = ${descricao}
      WHERE id_exercicio = ${id}
    `;

    // Se vieram novos arquivos, substitui todos os anteriores
    if (arquivos && arquivos.length > 0) {
      await db.sql`
        DELETE FROM Exercicio_Arquivos WHERE id_exercicio = ${id}
      `;
      for (const id_arquivo of arquivos) {
        await db.sql`
          INSERT INTO Exercicio_Arquivos (id_exercicio, id_arquivo)
          VALUES (${id}, ${id_arquivo})
        `;
      }
    }

    res.json({ mensagem: "Exercício atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /exercicios/:id — Deleta exercício e vínculos
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Exercicio_Arquivos WHERE id_exercicio = ${id}`;
    await db.sql`DELETE FROM Exercicio WHERE id_exercicio = ${id}`;

    res.json({ mensagem: "Exercício deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
