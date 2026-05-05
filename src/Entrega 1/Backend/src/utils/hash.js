// src/utils/hash.js
const bcrypt = require("bcryptjs");

async function hashSenha(senha) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

async function verificarSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

module.exports = { hashSenha, verificarSenha };
