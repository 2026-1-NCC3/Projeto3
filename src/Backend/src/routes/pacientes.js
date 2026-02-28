// src/routes/pacientes.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");
const { hashSenha } = require("../utils/hash");

// GET /pacientes — Lista todos os pacientes
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const pacientes = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.data_cadastro,
             p.telefone, p.data_nascimento, 
             p.observacoes, p.status_tratamento
      FROM Usuario u
      INNER JOIN Usuario_Paciente p ON u.id_usuario = p.id_usuario
      ORDER BY u.nome ASC
    `;
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /pacientes/ativos — Só pacientes ativos
router.get("/ativos", async (req, res) => {
  try {
    const db = getDb();
    const pacientes = await db.sql`
      SELECT u.id_usuario, u.nome, u.email,
             p.telefone, p.status_tratamento
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

// GET /pacientes/:id — Busca paciente completo com histórico
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const paciente = await db.sql`
      SELECT u.id_usuario, u.nome, u.email, u.data_cadastro,
             p.telefone, p.data_nascimento,
             p.observacoes, p.status_tratamento
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
      FROM Plano_Exercicios
      WHERE id_paciente = ${id}
    `;

    const execucoes = await db.sql`
      SELECT id_execucao, data_execucao, dor_nivel, 
             observacoes, concluido
      FROM Registro_Execucao
      WHERE id_paciente = ${id}
      ORDER BY data_execucao DESC
      LIMIT 5
    `;

    res.json({ ...paciente[0], planos, ultimas_execucoes: execucoes });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// POST /pacientes — Cria usuário + paciente com senha criptografada
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { nome, email, senha, telefone, data_nascimento, observacoes } =
      req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "nome, email e senha são obrigatórios",
      });
    }

    // Verifica se email já existe
    const emailExiste = await db.sql`
      SELECT id_usuario FROM Usuario WHERE email = ${email}
    `;
    if (emailExiste.length > 0) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    // ✅ Criptografa a senha
    const senhaCriptografada = await hashSenha(senha);

    await db.sql`
      INSERT INTO Usuario (nome, email, senha)
      VALUES (${nome}, ${email}, ${senhaCriptografada})
    `;

    const resultado = await db.sql`
      SELECT id_usuario FROM Usuario WHERE email = ${email}
    `;
    const id_novo = resultado[0].id_usuario;

    await db.sql`
      INSERT INTO Usuario_Paciente (id_usuario, telefone, data_nascimento, observacoes, status_tratamento)
      VALUES (${id_novo}, ${telefone}, ${data_nascimento}, ${observacoes}, 'Ativo')
    `;

    res.status(201).json({
      mensagem: "Paciente cadastrado com sucesso!",
      id_usuario: id_novo,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// PUT /pacientes/:id — Atualiza dados do paciente
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const {
      nome,
      email,
      senha,
      telefone,
      data_nascimento,
      observacoes,
      status_tratamento,
    } = req.body;

    // Se vier nova senha, criptografa — senão mantém a atual
    let senhaFinal;
    if (senha) {
      senhaFinal = await hashSenha(senha);
    } else {
      const atual = await db.sql`
        SELECT senha FROM Usuario WHERE id_usuario = ${id}
      `;
      senhaFinal = atual[0].senha;
    }

    await db.sql`
      UPDATE Usuario
      SET nome = ${nome}, email = ${email}, senha = ${senhaFinal}
      WHERE id_usuario = ${id}
    `;

    await db.sql`
      UPDATE Usuario_Paciente
      SET telefone = ${telefone},
          data_nascimento = ${data_nascimento},
          observacoes = ${observacoes},
          status_tratamento = ${status_tratamento}
      WHERE id_usuario = ${id}
    `;

    res.json({ mensagem: "Paciente atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /pacientes/:id — Deleta paciente e tudo vinculado
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    await db.sql`DELETE FROM Registro_Execucao WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Notificacao WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Plano_Exercicios WHERE id_paciente = ${id}`;
    await db.sql`DELETE FROM Usuario_Paciente WHERE id_usuario = ${id}`;
    await db.sql`DELETE FROM Usuario WHERE id_usuario = ${id}`;

    res.json({ mensagem: "Paciente deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
