// src/routes/consultas.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");

// GET /consultas/paciente/:id_paciente
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const consultas = await db.sql`
      SELECT id_consulta, data_consulta, status, observacoes
      FROM Consulta
      WHERE id_paciente = ${id_paciente}
      ORDER BY data_consulta ASC
    `;

    res.json(consultas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /consultas/paciente/:id_paciente/proximas
router.get("/paciente/:id_paciente/proximas", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const consultas = await db.sql`
      SELECT id_consulta, data_consulta, status, observacoes
      FROM Consulta
      WHERE id_paciente = ${id_paciente}
        AND status = 'agendada'
        AND data_consulta >= CURRENT_TIMESTAMP
      ORDER BY data_consulta ASC
    `;

    res.json(consultas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /consultas
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { data_consulta, observacoes, id_paciente, id_admin } = req.body;

    if (!data_consulta || !id_paciente || !id_admin) {
      return res.status(400).json({
        erro: "data_consulta, id_paciente e id_admin são obrigatórios",
      });
    }

    await db.sql`
      INSERT INTO Consulta (data_consulta, status, observacoes, id_paciente, id_admin)
      VALUES (${data_consulta}, 'agendada', ${observacoes}, ${id_paciente}, ${id_admin})
    `;

    res.status(201).json({ mensagem: "Consulta agendada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /consultas/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { data_consulta, status, observacoes } = req.body;

    await db.sql`
      UPDATE Consulta
      SET data_consulta = ${data_consulta},
          status = ${status},
          observacoes = ${observacoes}
      WHERE id_consulta = ${id}
    `;

    res.json({ mensagem: "Consulta atualizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /consultas/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Consulta WHERE id_consulta = ${id}`;

    res.json({ mensagem: "Consulta deletada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
