// src/database/db.js
const { Database } = require("@sqlitecloud/drivers");
require("dotenv").config();

let db;

async function connectDatabase() {
  try {
    db = new Database(process.env.SQLITE_CLOUD_URL);

    // Testa a conexão com uma query simples
    await db.sql`SELECT 1`;

    console.log("✅ Conectado ao SQLite Cloud com sucesso!");
    return db;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error.message);
    process.exit(1); // Encerra o servidor se não conectar
  }
}

function getDb() {
  if (!db) {
    throw new Error(
      "Banco de dados não inicializado. Chame connectDatabase() primeiro.",
    );
  }
  return db;
}

module.exports = { connectDatabase, getDb };
