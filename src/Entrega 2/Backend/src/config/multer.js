// src/config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    // Pega só a extensão do arquivo original ex: .mp4 .png
    const extensao = path.extname(file.originalname);

    // Resultado: 10-03-2026_14-35-22.mp4
    const nomeFinal = `${dia}-${mes}-${ano}_${hora}-${minuto}-${segundo}${extensao}`;

    cb(null, nomeFinal);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "video/avi",
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido. Use imagem ou vídeo."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;
