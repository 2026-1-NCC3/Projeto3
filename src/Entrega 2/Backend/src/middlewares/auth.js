// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, nome, perfil }
    next();
  } catch (error) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}

// Middleware para verificar se é admin
function apenasAdmin(req, res, next) {
  if (req.usuario.perfil !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito a administradores" });
  }
  next();
}

module.exports = { autenticar, apenasAdmin };
