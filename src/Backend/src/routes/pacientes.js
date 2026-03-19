// src/routes/pacientes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");
const { gerarIdLogin } = require("./auth");

// GET /pacientes
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const pacientes = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.id_login, u.data_cadastro,
             p.cpf, p.telefone, p.data_nascimento,
             p.observacoes, p.status_tratamento, p.consultas_pagas
      FROM Usuario u
      INNER JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      ORDER BY u.nome ASC
    `;
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /pacientes/ativos
router.get("/ativos", async (req, res) => {
  try {
    const db = getDb();
    const pacientes = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.id_login,
             p.cpf, p.telefone, p.status_tratamento, p.consultas_pagas
      FROM Usuario u
      INNER JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      WHERE p.status_tratamento = 'Ativo'
      ORDER BY u.nome ASC
    `;
    res.json({ total: pacientes.length, pacientes });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /pacientes/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const paciente = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.id_login, u.data_cadastro,
             p.cpf, p.telefone, p.data_nascimento,
             p.observacoes, p.status_tratamento, p.consultas_pagas
      FROM Usuario u
      INNER JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      WHERE u.id_usuario = ${id}
    `;

    if (paciente.length === 0) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    const planos = await db.sql`
      SELECT id_plano, data_inicio, data_final,
             frequencia, repeticoes, series, observacoes
      FROM Plano_Exercicios WHERE id_paciente = ${id}
    `;

    const execucoes = await db.sql`
      SELECT id_execucao, data_execucao, dor_nivel, observacoes, concluido
      FROM Registro_Execucao
      WHERE id_paciente = ${id}
      ORDER BY data_execucao DESC LIMIT 5
    `;

    const sessoes = await db.sql`
      SELECT id_sessao, data_sessao, anotacoes
      FROM Sessao
      WHERE id_paciente = ${id}
      ORDER BY data_sessao DESC
    `;

    const consultas = await db.sql`
      SELECT id_consulta, data_consulta, status, observacoes
      FROM Consulta
      WHERE id_paciente = ${id}
      ORDER BY data_consulta ASC
    `;

    res.json({
      ...paciente[0],
      planos,
      ultimas_execucoes: execucoes,
      sessoes,
      consultas,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /pacientes — admin cadastra paciente e gera id_login
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const {
      nome,
      email,
      cpf,
      telefone,
      data_nascimento,
      observacoes,
      consultas_pagas,
    } = req.body;

    if (!nome || !cpf) {
      return res.status(400).json({ erro: "nome e cpf são obrigatórios" });
    }

    // Verifica CPF duplicado
    const cpfExiste = await db.sql`
      SELECT id_usuario FROM Usuario_Paciente WHERE cpf = ${cpf}
    `;
    if (cpfExiste.length > 0) {
      return res.status(409).json({ erro: "CPF já cadastrado" });
    }

    // Gera id_login único de 6 dígitos
    const id_login = await gerarIdLogin(db);

    // Insere na tabela Usuario
    await db.sql`
      INSERT INTO Usuario (nome, email, id_login, cpf)
      VALUES (${nome}, ${email}, ${id_login}, ${cpf})
`;

    const resultado = await db.sql`
      SELECT id_usuario FROM Usuario WHERE id_login = ${id_login}
    `;
    const id_novo = resultado[0].id_usuario;

    // Insere na tabela Usuario_Paciente
    await db.sql`
      INSERT INTO Usuario_Paciente 
        (id_usuario, cpf, telefone, data_nascimento, 
         observacoes, status_tratamento, consultas_pagas)
      VALUES 
        (${id_novo}, ${cpf}, ${telefone}, ${data_nascimento},
         ${observacoes}, 'Ativo', ${consultas_pagas || 0})
    `;

    res.status(201).json({
      mensagem: "Paciente cadastrado com sucesso!",
      id_usuario: id_novo,
      id_login,
      instrucoes: `Informe ao paciente: CPF + código ${id_login} para acessar o app`,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /pacientes/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      nome,
      email,
      telefone,
      data_nascimento,
      observacoes,
      status_tratamento,
      consultas_pagas,
    } = req.body;

    await db.sql`
      UPDATE Usuario SET nome = ${nome}, email = ${email}
      WHERE id_usuario = ${id}
    `;

    await db.sql`
      UPDATE Usuario_Paciente
      SET telefone = ${telefone},
          data_nascimento = ${data_nascimento},
          observacoes = ${observacoes},
          status_tratamento = ${status_tratamento},
          consultas_pagas = ${consultas_pagas}
      WHERE id_usuario = ${id}
    `;

    res.json({ mensagem: "Paciente atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /pacientes/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Registro_Execucao WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Notificacao WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Lembrete_Paciente WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Sessao WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Consulta WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Usuario_Paciente WHERE id_usuario = ${id}`;
    await db.sql`DELETE FROM Usuario WHERE id_usuario = ${id}`;

    res.json({ mensagem: "Paciente deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
