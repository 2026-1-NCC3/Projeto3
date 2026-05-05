// src/routes/arquivos.js
const express = require("express");
const router = express.Router();
const { getDb } = require("../database/db");
const upload = require("../config/multer");
const path = require("path");
const fs = require("fs");

// POST /arquivos/upload — Faz upload e salva no banco
router.post("/upload", upload.single("arquivo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    const db = getDb();

    // Define o tipo pelo mimetype
    const tipo = req.file.mimetype.startsWith("video") ? "video" : "imagem";

    // Caminho acessível via URL ex: /uploads/1741234567890-alongamento.mp4
    const caminho = `/uploads/${req.file.filename}`;

    await db.sql`
      INSERT INTO Arquivo (tipo_arquivo, nome_arquivo)
      VALUES (${tipo}, ${caminho})
    `;

    const resultado = await db.sql`
      SELECT id_arquivo FROM Arquivo 
      ORDER BY id_arquivo DESC LIMIT 1
    `;

    res.status(201).json({
      mensagem: "Arquivo enviado com sucesso!",
      id_arquivo: resultado[0].id_arquivo,
      tipo_arquivo: tipo,
      caminho,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /arquivos — Lista todos os arquivos
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const arquivos = await db.sql`
      SELECT id_arquivo, tipo_arquivo, nome_arquivo 
      FROM Arquivo
    `;
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// GET /arquivos/:id — Busca um arquivo por ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const arquivo = await db.sql`
      SELECT id_arquivo, tipo_arquivo, nome_arquivo 
      FROM Arquivo 
      WHERE id_arquivo = ${id}
    `;

    if (arquivo.length === 0) {
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    res.json(arquivo[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// DELETE /arquivos/:id — Deleta arquivo do banco e da pasta
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const arquivo = await db.sql`
      SELECT nome_arquivo FROM Arquivo WHERE id_arquivo = ${id}
    `;

    if (arquivo.length === 0) {
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    // Remove o arquivo físico da pasta uploads
    const caminhoFisico = path.join(
      __dirname,
      "..",
      "uploads",
      path.basename(arquivo[0].nome_arquivo),
    );

    if (fs.existsSync(caminhoFisico)) {
      fs.unlinkSync(caminhoFisico);
    }

    await db.sql`DELETE FROM Arquivo WHERE id_arquivo = ${id}`;

    res.json({ mensagem: "Arquivo deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
