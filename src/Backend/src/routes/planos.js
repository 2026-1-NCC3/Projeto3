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

// GET /planos/:id — Busca plano com exercícios e arquivos
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

    const exercicios = await db.sql`
      SELECT e.id_exercicio, e.titulo, e.descricao
      FROM Atividades_Prescritas ap
      JOIN Exercicio e ON ap.id_exercicio = e.id_exercicio
      WHERE ap.id_plano = ${id}
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

    res.json({ ...plano[0], exercicios: exerciciosComArquivos });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /planos/paciente/:id_paciente — Planos de um paciente com exercícios
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const planos = await db.sql`
      SELECT id_plano, data_inicio, data_final,
             frequencia, repeticoes, series, observacoes
      FROM Plano_Exercicios
      WHERE id_paciente = ${id_paciente}
    `;

    const planosComExercicios = await Promise.all(
      planos.map(async (plano) => {
        const exercicios = await db.sql`
          SELECT e.id_exercicio, e.titulo, e.descricao
          FROM Atividades_Prescritas ap
          JOIN Exercicio e ON ap.id_exercicio = e.id_exercicio
          WHERE ap.id_plano = ${plano.id_plano}
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

        return { ...plano, exercicios: exerciciosComArquivos };
      }),
    );

    res.json(planosComExercicios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /planos — Cria plano e vincula vários exercícios
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
      exercicios,
    } = req.body;

    if (!data_inicio || !data_final || !id_paciente) {
      return res.status(400).json({
        erro: "data_inicio, data_final e id_paciente são obrigatórios",
      });
    }

    if (!exercicios || exercicios.length === 0) {
      return res.status(400).json({
        erro: 'Informe pelo menos um exercício no array "exercicios"',
      });
    }

    await db.sql`
      INSERT INTO Plano_Exercicios
        (data_inicio, data_final, frequencia, repeticoes, series, observacoes, id_admin, id_paciente)
      VALUES
        (${data_inicio}, ${data_final}, ${frequencia}, ${repeticoes}, ${series}, ${observacoes}, ${id_admin}, ${id_paciente})
    `;

    const resultado = await db.sql`
      SELECT id_plano FROM Plano_Exercicios 
      ORDER BY id_plano DESC LIMIT 1
    `;
    const id_plano = resultado[0].id_plano;

    for (const id_exercicio of exercicios) {
      await db.sql`
        INSERT INTO Atividades_Prescritas (id_plano, id_exercicio)
        VALUES (${id_plano}, ${id_exercicio})
      `;
    }

    res.status(201).json({
      mensagem: "Plano criado com sucesso!",
      id_plano,
      exercicios_vinculados: exercicios.length,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /planos/:id — Atualiza plano e substitui exercícios
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
      exercicios,
    } = req.body;

    await db.sql`
      UPDATE Plano_Exercicios
      SET data_inicio = ${data_inicio}, data_final = ${data_final},
          frequencia = ${frequencia}, repeticoes = ${repeticoes},
          series = ${series}, observacoes = ${observacoes}
      WHERE id_plano = ${id}
    `;

    if (exercicios && exercicios.length > 0) {
      await db.sql`DELETE FROM Atividades_Prescritas WHERE id_plano = ${id}`;
      for (const id_exercicio of exercicios) {
        await db.sql`
          INSERT INTO Atividades_Prescritas (id_plano, id_exercicio)
          VALUES (${id}, ${id_exercicio})
        `;
      }
    }

    res.json({ mensagem: "Plano atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /planos/:id — Deleta plano e exercícios vinculados
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
