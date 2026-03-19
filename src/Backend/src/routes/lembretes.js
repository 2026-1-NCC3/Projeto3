// src/routes/lembretes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");
const upload = require("../config/multer");

// GET /lembretes — Lista todos
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const lembretes = await db.sql`
      SELECT l.id_lembrete, l.titulo, l.descricao, l.foto,
             l.intervalo_minutos, l.horario_inicio, l.horario_fim,
             l.data_criacao, u.nome AS admin
      FROM Lembrete l
      LEFT JOIN Usuario u ON l.id_admin = u.id_usuario
      ORDER BY l.data_criacao DESC
    `;
    res.json(lembretes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /lembretes/:id — Busca um com pacientes vinculados
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const lembrete = await db.sql`
      SELECT l.id_lembrete, l.titulo, l.descricao, l.foto,
             l.intervalo_minutos, l.horario_inicio, l.horario_fim,
             l.data_criacao, u.nome AS admin
      FROM Lembrete l
      LEFT JOIN Usuario u ON l.id_admin = u.id_usuario
      WHERE l.id_lembrete = ${id}
    `;

    if (lembrete.length === 0) {
      return res.status(404).json({ erro: "Lembrete não encontrado" });
    }

    const pacientes = await db.sql`
      SELECT u.id_usuario, u.nome, lp.ativo
      FROM Lembrete_Paciente lp
      JOIN Usuario u ON lp.id_paciente = u.id_usuario
      WHERE lp.id_lembrete = ${id}
    `;

    res.json({ ...lembrete[0], pacientes });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /lembretes/paciente/:id_paciente — Lembretes de um paciente
router.get("/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_paciente } = req.params;

    const lembretes = await db.sql`
      SELECT l.id_lembrete, l.titulo, l.descricao, l.foto,
             l.intervalo_minutos, l.horario_inicio, l.horario_fim,
             lp.ativo
      FROM Lembrete_Paciente lp
      JOIN Lembrete l ON lp.id_lembrete = l.id_lembrete
      WHERE lp.id_paciente = ${id_paciente}
      ORDER BY l.data_criacao DESC
    `;

    res.json(lembretes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /lembretes/upload — Upload da foto + cria lembrete
router.post("/upload", upload.single("foto"), async (req, res) => {
  try {
    const db = getDb();
    const {
      titulo,
      descricao,
      intervalo_minutos,
      horario_inicio,
      horario_fim,
      id_admin,
      pacientes,
    } = req.body;

    if (!titulo || !id_admin) {
      return res
        .status(400)
        .json({ erro: "titulo e id_admin são obrigatórios" });
    }

    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    await db.sql`
      INSERT INTO Lembrete 
        (titulo, descricao, foto, intervalo_minutos, 
         horario_inicio, horario_fim, id_admin)
      VALUES 
        (${titulo}, ${descricao}, ${foto}, ${intervalo_minutos},
         ${horario_inicio}, ${horario_fim}, ${id_admin})
    `;

    const resultado = await db.sql`
      SELECT id_lembrete FROM Lembrete 
      ORDER BY id_lembrete DESC LIMIT 1
    `;
    const id_lembrete = resultado[0].id_lembrete;

    // Vincula pacientes se vieram no body
    if (pacientes) {
      const listaPacientes = JSON.parse(pacientes);
      for (const id_paciente of listaPacientes) {
        await db.sql`
          INSERT INTO Lembrete_Paciente (id_lembrete, id_paciente, ativo)
          VALUES (${id_lembrete}, ${id_paciente}, 1)
        `;
      }
    }

    res.status(201).json({
      mensagem: "Lembrete criado com sucesso!",
      id_lembrete,
      foto,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /lembretes — Cria sem foto
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const {
      titulo,
      descricao,
      intervalo_minutos,
      horario_inicio,
      horario_fim,
      id_admin,
      pacientes,
    } = req.body;

    if (!titulo || !id_admin) {
      return res
        .status(400)
        .json({ erro: "titulo e id_admin são obrigatórios" });
    }

    await db.sql`
      INSERT INTO Lembrete 
        (titulo, descricao, intervalo_minutos, 
         horario_inicio, horario_fim, id_admin)
      VALUES 
        (${titulo}, ${descricao}, ${intervalo_minutos},
         ${horario_inicio}, ${horario_fim}, ${id_admin})
    `;

    const resultado = await db.sql`
      SELECT id_lembrete FROM Lembrete 
      ORDER BY id_lembrete DESC LIMIT 1
    `;
    const id_lembrete = resultado[0].id_lembrete;

    if (pacientes && pacientes.length > 0) {
      for (const id_paciente of pacientes) {
        await db.sql`
          INSERT INTO Lembrete_Paciente (id_lembrete, id_paciente, ativo)
          VALUES (${id_lembrete}, ${id_paciente}, 1)
        `;
      }
    }

    res.status(201).json({
      mensagem: "Lembrete criado com sucesso!",
      id_lembrete,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /lembretes/:id — Atualiza dados do lembrete
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      titulo,
      descricao,
      intervalo_minutos,
      horario_inicio,
      horario_fim,
      pacientes,
      remover_foto,
    } = req.body;

    if (remover_foto) {
      await db.sql`
        UPDATE Lembrete
        SET titulo = ${titulo}, descricao = ${descricao},
            foto = NULL,
            intervalo_minutos = ${intervalo_minutos},
            horario_inicio = ${horario_inicio},
            horario_fim = ${horario_fim}
        WHERE id_lembrete = ${id}
      `;
    } else {
      await db.sql`
        UPDATE Lembrete
        SET titulo = ${titulo}, descricao = ${descricao},
            intervalo_minutos = ${intervalo_minutos},
            horario_inicio = ${horario_inicio},
            horario_fim = ${horario_fim}
        WHERE id_lembrete = ${id}
      `;
    }

    if (pacientes && pacientes.length > 0) {
      await db.sql`DELETE FROM Lembrete_Paciente WHERE id_lembrete = ${id}`;
      for (const id_paciente of pacientes) {
        await db.sql`
          INSERT INTO Lembrete_Paciente (id_lembrete, id_paciente, ativo)
          VALUES (${id}, ${id_paciente}, 1)
        `;
      }
    }

    res.json({ mensagem: "Lembrete atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /lembretes/:id/upload — Atualiza com nova foto
router.put("/:id/upload", upload.single("foto"), async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      titulo,
      descricao,
      intervalo_minutos,
      horario_inicio,
      horario_fim,
      pacientes,
    } = req.body;

    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    if (foto) {
      await db.sql`
        UPDATE Lembrete
        SET titulo = ${titulo}, descricao = ${descricao},
            foto = ${foto}, intervalo_minutos = ${intervalo_minutos},
            horario_inicio = ${horario_inicio}, horario_fim = ${horario_fim}
        WHERE id_lembrete = ${id}
      `;
    } else {
      await db.sql`
        UPDATE Lembrete
        SET titulo = ${titulo}, descricao = ${descricao},
            intervalo_minutos = ${intervalo_minutos},
            horario_inicio = ${horario_inicio}, horario_fim = ${horario_fim}
        WHERE id_lembrete = ${id}
      `;
    }

    if (pacientes) {
      const listaPacientes = JSON.parse(pacientes);
      await db.sql`DELETE FROM Lembrete_Paciente WHERE id_lembrete = ${id}`;
      for (const id_paciente of listaPacientes) {
        await db.sql`
          INSERT INTO Lembrete_Paciente (id_lembrete, id_paciente, ativo)
          VALUES (${id}, ${id_paciente}, 1)
        `;
      }
    }

    res.json({ mensagem: "Lembrete atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PATCH /lembretes/:id_lembrete/paciente/:id_paciente — Ativa/desativa
router.patch("/:id_lembrete/paciente/:id_paciente", async (req, res) => {
  try {
    const db = getDb();
    const { id_lembrete, id_paciente } = req.params;
    const { ativo } = req.body;

    await db.sql`
      UPDATE Lembrete_Paciente
      SET ativo = ${ativo}
      WHERE id_lembrete = ${id_lembrete} AND id_paciente = ${id_paciente}
    `;

    res.json({ mensagem: `Lembrete ${ativo ? "ativado" : "desativado"}!` });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /lembretes/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Lembrete_Paciente WHERE id_lembrete = ${id}`;
    await db.sql`DELETE FROM Lembrete WHERE id_lembrete = ${id}`;

    res.json({ mensagem: "Lembrete deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
